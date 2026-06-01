import { StateGraph, START, END, MemorySaver, Annotation } from '@langchain/langgraph';
import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from '@langchain/core/messages';
import { ChatOllama } from '@langchain/ollama';
import { env } from '@/config/environment.js';

// Define the State structure the graph will maintain during an interview
export const InterviewState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  roleName: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => 'General',
  }),
  questions: Annotation<Array<{ questionId: string; text: string; idealAnswer: string }>>({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
  currentQuestionIndex: Annotation<number>({
    reducer: (x, y) => y ?? x,
    default: () => 0,
  }),
  evaluations: Annotation<Array<{ questionId: string; questionText: string; candidateAnswer: string; idealAnswer: string; score: number; feedback: string }>>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  isFinished: Annotation<boolean>({
    reducer: (x, y) => y ?? x,
    default: () => false,
  }),
});

// Create shared Ollama models (we create isolated instances here for concurrency safety)
const chatModel = new ChatOllama({ model: env.OLLAMA_MODEL || 'qwen2.5:7b', temperature: 0.7, baseUrl: env.OLLAMA_BASE_URL });
const strictModel = new ChatOllama({ model: env.OLLAMA_MODEL || 'qwen2.5:7b', temperature: 0.1, baseUrl: env.OLLAMA_BASE_URL, format: 'json' });

// ============================================
// NODE: Ask Question
// ============================================
const askQuestionNode = async (state: typeof InterviewState.State) => {
  // If there are no more questions
  if (state.currentQuestionIndex >= state.questions.length) {
    return {
      messages: [new AIMessage("Thank you for your time. That completes all our questions. We will evaluate your responses and share the final results soon.")],
      isFinished: true
    };
  }

  const currentQ = state.questions[state.currentQuestionIndex] || { text: "", idealAnswer: "", questionId: "" };
  
  // Custom bridging logic for transitioning after Intro Questions
  let prefix = "";
  if (state.currentQuestionIndex === 3) {
    prefix = "Thank you for that background! Moving on to the technical evaluation, the first question is: ";
  }

  // Ask the node
  return {
    messages: [new AIMessage(prefix + currentQ.text)]
  };
};

// ============================================
// NODE: Analyze Response
// ============================================
const analyzeResponseNode = async (state: typeof InterviewState.State) => {
  const lastMessage = state.messages[state.messages.length - 1];
  const candidateAnswer = lastMessage && typeof lastMessage.content === 'string' ? lastMessage.content : lastMessage ? JSON.stringify(lastMessage.content) : "";

  const currentQ = state.questions[state.currentQuestionIndex] || { text: "", idealAnswer: "", questionId: "" };

  // 1) First check if the candidate is asking for a hint or clarification INSTEAD of answering
  const clarificationCheckPrompt = `
  You are an intent analyzer. The candidate just responded to the interview question: "${currentQ.text}".
  Candidate Response: "${candidateAnswer}"

  Analyze if the candidate is ACTUALLY answering the question, OR if they are asking for clarification, asking for a hint, expressing extreme confusion, or saying they don't know yet.
  Return entirely JSON: {"isAskingForHintOrClarification": true/false}
  `.trim();

  try {
    const intentRes = await strictModel.invoke([new SystemMessage(clarificationCheckPrompt)]);
    const intentStr = typeof intentRes.content === 'string' ? intentRes.content : JSON.stringify(intentRes.content);
    const intentObj = JSON.parse(intentStr.substring(intentStr.indexOf('{'), intentStr.lastIndexOf('}') + 1));

    if (intentObj.isAskingForHintOrClarification) {
      // Provide a helpful hint without advancing the question index
      const hintPrompt = `
      You are a supportive AI interviewer. 
      The candidate was asked: "${currentQ.text}".
      They replied: "${candidateAnswer}".
      Give them a brief, encouraging, 1-2 sentence hint or clarification to help them answer. DO NOT give away the exact answer.
      `;
      const hintResponse = await chatModel.invoke([new SystemMessage(hintPrompt)]);
      return {
          messages: [new AIMessage(hintResponse.content)]
          // We DO NOT advance currentQuestionIndex, so the routing will loop back to 'waitForReply'
      };
    }
  } catch (e) {
    console.error("Intent check failed, falling back to evaluation.");
  }

  // 2) Normal Evaluation path
  const evaluatePrompt = `
  You are a strict but fair AI HR Interviewer.
  QUESTION ASKED: "${currentQ.text}"
  IDEAL ANSWER: "${currentQ.idealAnswer}"
  CANDIDATE ANSWER: "${candidateAnswer}"

  Evaluate the candidate's answer based on the ideal answer.
  Scoring strictly from 0 to 100.
  - 85-100: Exceptional coverage of key concepts.
  - 50-84: Acceptable, covered some main points.
  - 0-49: Vague, incorrect, or missing critical points.

  Return ONLY valid JSON in this exact format:
  {
    "score": <number>,
    "feedback": "<1-2 sentence constructive feedback>"
  }
  `.trim();

  let score = 0;
  let feedback = "Failed to evaluate response.";

  try {
    const response = await strictModel.invoke([new SystemMessage(evaluatePrompt)]);
    const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
    
    const parsed = JSON.parse(content.substring(content.indexOf('{'), content.lastIndexOf('}') + 1));
    score = parsed.score || 0;
    feedback = parsed.feedback || "Evaluated.";
  } catch (err) {
    console.error("Error evaluating answer in LangGraph:", err);
  }

  const evaluationMetadata = {
    questionId: currentQ.questionId,
    questionText: currentQ.text,
    candidateAnswer: candidateAnswer,
    idealAnswer: currentQ.idealAnswer,
    score,
    feedback
  };

  return {
    evaluations: [evaluationMetadata],
    currentQuestionIndex: state.currentQuestionIndex + 1
  };
};

// ============================================
// ROUTING LOGIC
// ============================================
const afterAnalysisRoute = (state: typeof InterviewState.State) => {
    // If the system generated an AIMessage during analyzeResponseNode (e.g., a Hint)
    // we should wait for the user's next reply rather than asking the next question.
    const lastMessage = state.messages[state.messages.length - 1];
    if (lastMessage instanceof AIMessage) {
        return "waitForReply";
    }

    if (state.currentQuestionIndex >= state.questions.length) {
        return "askQuestionNode"; // Ask question node handles the finishing goodbye
    }
    return "askQuestionNode";
};

// Construct the State Machine
const builder = new StateGraph(InterviewState)
  .addNode("askQuestionNode", askQuestionNode)
  .addNode("analyzeResponseNode", analyzeResponseNode)

  // Start by asking the first question (or greeting)
  .addEdge(START, "askQuestionNode")
  
  // After asking a question, we naturally wait for the human to answer (END representing the human turn boundary natively)
  .addEdge("askQuestionNode", END as any)

  // When human provides an answer, we evaluate it
  .addEdge(START as any, "analyzeResponseNode")

  // After evaluation, we either ask the next question, or if finished/requesting hint, yield
  .addConditionalEdges("analyzeResponseNode", afterAnalysisRoute, {
     "askQuestionNode": "askQuestionNode",
     "waitForReply": END as any
  });

export const interviewGraph = builder.compile({
  checkpointer: new MemorySaver()
});
