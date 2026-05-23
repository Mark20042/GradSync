import "dotenv/config";
import mongoose from "mongoose";
import { env } from "./src/config/environment.js";
import Interview from "./src/models/Interview.model.js";
import InterviewRole from "./src/models/InterviewRole.model.js";

const fixCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected to MongoDB.");

    const interviews = await Interview.find({});
    console.log(`Found ${interviews.length} interviews to check.`);

    let updatedCount = 0;

    for (const interview of interviews) {
      let needsUpdate = false;
      const role = await InterviewRole.findOne({ roleName: interview.roleName });
      const roleQuestions = role ? role.questions : [];

      const updatedAnswers = interview.answers.map((ans: any) => {
        let cat = ans.category || "General";
        
        if (!ans.category || ans.category === "General") {
          // Try to find it
          if (String(ans.questionId).startsWith("intro_1")) cat = "Communication";
          else if (String(ans.questionId).startsWith("intro_2")) cat = "General";
          else if (String(ans.questionId).startsWith("intro_3")) cat = "Behavioral";
          else {
            const matchedQ = roleQuestions.find((rq: any) => String(rq._id) === String(ans.questionId));
            if (matchedQ && matchedQ.category) cat = matchedQ.category;
            else if (!ans.questionId) {
                // Intro questions might not have questionId in old db
                if (ans.questionText.includes("plan to handle the responsibilities")) cat = "Communication";
                else if (ans.questionText.includes("specific skills or software")) cat = "General";
                else if (ans.questionText.includes("stay organized and continuously improve")) cat = "Behavioral";
            }
          }
          
          if (ans.category !== cat) {
             ans.category = cat;
             needsUpdate = true;
          }
        }
        return ans;
      });

      if (needsUpdate || !interview.aiFeedback?.categoryScores) {
        // Calculate new scores
        const categoryTotals: Record<string, number> = {};
        const categoryCounts: Record<string, number> = {};
        
        updatedAnswers.forEach((ans: any) => {
          const c = ans.category || "General";
          if (!categoryTotals[c]) { categoryTotals[c] = 0; categoryCounts[c] = 0; }
          categoryTotals[c] += ans.score || 0;
          categoryCounts[c] += 1;
        });
        
        const categoryScores: Record<string, number> = {};
        let highestCategory = { name: "", score: -1 };
        let lowestCategory = { name: "", score: 101 };
        
        Object.keys(categoryTotals).forEach(c => {
          const avg = Math.round(categoryTotals[c] / categoryCounts[c]);
          categoryScores[c] = avg;
          if (avg > highestCategory.score) highestCategory = { name: c, score: avg };
          if (avg < lowestCategory.score) lowestCategory = { name: c, score: avg };
        });
        
        let categoryInterpretation = `The candidate showed a balanced performance across all evaluated areas.`;
        if (highestCategory.name && lowestCategory.name && highestCategory.name !== lowestCategory.name) {
          if (highestCategory.score >= 80 && lowestCategory.score < 60) {
            categoryInterpretation = `The candidate excelled remarkably in ${highestCategory.name} but exhibited significant gaps in ${lowestCategory.name}.`;
          } else if (highestCategory.score - lowestCategory.score >= 15) {
            categoryInterpretation = `The candidate is strongest in ${highestCategory.name} but lacks slightly in ${lowestCategory.name}.`;
          }
        }

        interview.answers = updatedAnswers;
        
        if (!interview.aiFeedback) {
            interview.aiFeedback = {};
        }
        
        interview.aiFeedback.categoryScores = categoryScores;
        interview.aiFeedback.categoryInterpretation = categoryInterpretation;

        await Interview.updateOne({ _id: interview._id }, {
           $set: { 
             answers: updatedAnswers,
             "aiFeedback.categoryScores": categoryScores,
             "aiFeedback.categoryInterpretation": categoryInterpretation
           }
        });
        updatedCount++;
      }
    }

    console.log(`Successfully updated ${updatedCount} old interviews with correct categories.`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

fixCategories();
