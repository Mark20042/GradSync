import React from 'react';
import { Page, Text, View, Document, StyleSheet, Link, Font } from '@react-pdf/renderer';

// Register a standard font if needed, or use default Helvetica/Times
// For now, we'll use standard fonts to ensure compatibility

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        padding: 40,
        fontFamily: 'Times-Roman',
        fontSize: 10,
        lineHeight: 1.5,
        color: '#1f2937', // gray-800
    },
    header: {
        borderBottomWidth: 2,
        borderBottomColor: '#111827', // gray-900
        paddingBottom: 15,
        marginBottom: 20,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: '#111827',
        marginBottom: 8,
        fontFamily: 'Times-Bold',
    },
    contactRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
        fontSize: 9,
        color: '#4b5563', // gray-600
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        borderBottomWidth: 1,
        borderBottomColor: '#d1d5db', // gray-300
        paddingBottom: 4,
        marginBottom: 8,
        color: '#111827',
        fontFamily: 'Times-Bold',
        letterSpacing: 1,
    },
    itemTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 2,
    },
    itemTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#111827',
        fontFamily: 'Times-Bold',
    },
    itemDate: {
        fontSize: 9,
        color: '#4b5563',
        fontStyle: 'italic',
    },
    itemSubtitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    itemCompany: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#1f2937',
        fontFamily: 'Times-Bold',
    },
    itemLocation: {
        fontSize: 9,
        color: '#6b7280', // gray-500
        fontStyle: 'italic',
    },
    itemDescription: {
        fontSize: 9,
        color: '#374151', // gray-700
        marginBottom: 4,
        textAlign: 'justify',
    },
    skillsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5,
    },
    skillItem: {
        fontSize: 9,
        color: '#1f2937',
        fontWeight: 'bold',
        fontFamily: 'Times-Bold',
    },
    link: {
        color: '#1f2937',
        textDecoration: 'none',
    },
});

// Helper to format dates
const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
};

const ResumePDF = ({ user }) => {
    if (!user) return null;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.name}>{user.fullName}</Text>
                    <View style={styles.contactRow}>
                        {user.email && <Text style={styles.contactItem}>{user.email}</Text>}
                        {user.phone && <Text style={styles.contactItem}>• {user.phone}</Text>}
                        {user.address && <Text style={styles.contactItem}>• {user.address}</Text>}
                        {user.website && (
                            <Text style={styles.contactItem}>
                                • <Link src={user.website} style={styles.link}>{user.website.replace(/^https?:\/\//, '')}</Link>
                            </Text>
                        )}
                        {user.linkedin && (
                            <Text style={styles.contactItem}>
                                • <Link src={user.linkedin} style={styles.link}>LinkedIn</Link>
                            </Text>
                        )}
                        {user.github && (
                            <Text style={styles.contactItem}>
                                • <Link src={user.github} style={styles.link}>GitHub</Link>
                            </Text>
                        )}
                    </View>
                </View>

                {/* Summary */}
                {user.bio && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Professional Summary</Text>
                        <Text style={styles.itemDescription}>{user.bio}</Text>
                    </View>
                )}

                {/* Experience */}
                {user.experiences && user.experiences.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Work Experience</Text>
                        {user.experiences.map((exp, index) => (
                            <View key={index} style={{ marginBottom: 8 }}>
                                <View style={styles.itemTitleRow}>
                                    <Text style={styles.itemTitle}>{exp.title}</Text>
                                    <Text style={styles.itemDate}>
                                        {formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}
                                    </Text>
                                </View>
                                <View style={styles.itemSubtitleRow}>
                                    <Text style={styles.itemCompany}>{exp.company}</Text>
                                    {exp.location && <Text style={styles.itemLocation}>{exp.location}</Text>}
                                </View>
                                {exp.description && <Text style={styles.itemDescription}>{exp.description}</Text>}
                            </View>
                        ))}
                    </View>
                )}

                {/* Internships */}
                {user.internships && user.internships.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Internships</Text>
                        {user.internships.map((intern, index) => (
                            <View key={index} style={{ marginBottom: 8 }}>
                                <View style={styles.itemTitleRow}>
                                    <Text style={styles.itemTitle}>{intern.title}</Text>
                                    <Text style={styles.itemDate}>
                                        {formatDate(intern.startDate)} – {intern.current ? "Present" : formatDate(intern.endDate)}
                                    </Text>
                                </View>
                                <View style={styles.itemSubtitleRow}>
                                    <Text style={styles.itemCompany}>{intern.company}</Text>
                                    {intern.location && <Text style={styles.itemLocation}>{intern.location}</Text>}
                                </View>
                                {intern.description && <Text style={styles.itemDescription}>{intern.description}</Text>}
                            </View>
                        ))}
                    </View>
                )}

                {/* Education */}
                {user.education && user.education.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Education</Text>
                        {user.education.map((edu, index) => (
                            <View key={index} style={{ marginBottom: 8 }}>
                                <View style={styles.itemTitleRow}>
                                    <Text style={styles.itemTitle}>{edu.school}</Text>
                                    <Text style={styles.itemDate}>
                                        {formatDate(edu.startDate)} – {edu.endDate ? formatDate(edu.endDate) : "Present"}
                                    </Text>
                                </View>
                                <View style={styles.itemSubtitleRow}>
                                    <Text style={styles.itemCompany}>{edu.degree}</Text>
                                    {edu.location && <Text style={styles.itemLocation}>{edu.location}</Text>}
                                </View>
                                {edu.activities && (
                                    <Text style={styles.itemDescription}>Activities: {edu.activities}</Text>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* Skills */}
                {user.skills && user.skills.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Skills</Text>
                        <View style={styles.skillsRow}>
                            {Array.isArray(user.skills) ? (
                                user.skills.map((skill, index) => (
                                    <Text key={index} style={styles.skillItem}>
                                        {skill}{index < user.skills.length - 1 ? " • " : ""}
                                    </Text>
                                ))
                            ) : (
                                <Text style={styles.skillItem}>{user.skills}</Text>
                            )}
                        </View>
                    </View>
                )}

                {/* Projects */}
                {user.projects && user.projects.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Projects</Text>
                        {user.projects.map((project, index) => (
                            <View key={index} style={{ marginBottom: 8 }}>
                                <View style={styles.itemTitleRow}>
                                    <Text style={styles.itemTitle}>{project.name}</Text>
                                    {(project.startDate || project.endDate) && (
                                        <Text style={styles.itemDate}>
                                            {formatDate(project.startDate)} – {formatDate(project.endDate)}
                                        </Text>
                                    )}
                                </View>
                                {project.description && <Text style={styles.itemDescription}>{project.description}</Text>}
                                {project.url && (
                                    <Link src={project.url} style={{ fontSize: 9, color: '#4b5563' }}>{project.url}</Link>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* Certifications */}
                {user.certifications && user.certifications.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Certifications</Text>
                        {user.certifications.map((cert, index) => (
                            <View key={index} style={{ marginBottom: 6 }}>
                                <View style={styles.itemTitleRow}>
                                    <Text style={styles.itemTitle}>{cert.name}</Text>
                                    <Text style={styles.itemDate}>{formatDate(cert.issueDate)}</Text>
                                </View>
                                <Text style={styles.itemCompany}>{cert.issuer}</Text>
                                {cert.credentialID && <Text style={styles.itemDescription}>ID: {cert.credentialID}</Text>}
                            </View>
                        ))}
                    </View>
                )}

                {/* Awards */}
                {user.awards && user.awards.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Awards</Text>
                        {user.awards.map((award, index) => (
                            <View key={index} style={{ marginBottom: 6 }}>
                                <View style={styles.itemTitleRow}>
                                    <Text style={styles.itemTitle}>{award.title}</Text>
                                    <Text style={styles.itemDate}>{formatDate(award.date)}</Text>
                                </View>
                                <Text style={styles.itemCompany}>{award.issuer}</Text>
                                {award.description && <Text style={styles.itemDescription}>{award.description}</Text>}
                            </View>
                        ))}
                    </View>
                )}

                {/* Languages */}
                {user.languages && user.languages.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Languages</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 15 }}>
                            {user.languages.map((lang, index) => (
                                <Text key={index} style={{ fontSize: 10 }}>
                                    <Text style={{ fontFamily: 'Helvetica-Bold' }}>{lang.language}</Text> ({lang.proficiency})
                                </Text>
                            ))}
                        </View>
                    </View>
                )}
            </Page>
        </Document>
    );
};

export default ResumePDF;
