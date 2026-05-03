import React from 'react';
import { Page, Document, View, Text as PDFText, Link } from '@react-pdf/renderer';
import { Heading } from '../../components/pdfx/heading/pdfx-heading';
import { Text } from '../../components/pdfx/text/pdfx-text';
import { Section } from '../../components/pdfx/section/pdfx-section';
import { Divider } from '../../components/pdfx/divider/pdfx-divider';
import { KeyValue } from '../../components/pdfx/key-value/pdfx-key-value';
import { theme } from '../../lib/pdfx-theme';

// Helper to format dates
const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
};

const ResumePDFx = ({ user }) => {
    if (!user) return null;

    const pageStyle = {
        flexDirection: 'column',
        backgroundColor: theme.colors.background,
        padding: theme.page.padding,
        fontFamily: theme.typography.body.fontFamily,
        fontSize: theme.typography.body.fontSize,
        lineHeight: theme.typography.body.lineHeight,
        color: theme.colors.foreground,
    };

    const headerStyle = {
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.primary,
        paddingBottom: theme.spacing.lg,
        marginBottom: theme.spacing.xl,
    };

    const contactRowStyle = {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
        fontSize: 9,
        color: theme.colors.mutedForeground,
        marginTop: theme.spacing.sm,
    };

    const contactItemStyle = {
        fontFamily: 'Times-Roman',
    };

    const itemContainerStyle = {
        marginBottom: theme.spacing.md,
    };

    const titleRowStyle = {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 2,
    };

    const titleStyle = {
        fontSize: 11,
        fontFamily: 'Times-Bold',
        color: theme.colors.primary,
    };

    const dateStyle = {
        fontSize: 9,
        color: theme.colors.mutedForeground,
        fontStyle: 'italic',
    };

    const subtitleRowStyle = {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.xs,
    };

    const companyStyle = {
        fontSize: 10,
        fontFamily: 'Times-Bold',
        color: theme.colors.foreground,
    };

    const locationStyle = {
        fontSize: 9,
        color: theme.colors.mutedForeground,
        fontStyle: 'italic',
    };

    const descriptionStyle = {
        fontSize: 9,
        color: theme.colors.foreground,
        textAlign: 'justify',
        lineHeight: 1.5,
    };

    const skillsRowStyle = {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5,
    };

    const skillItemStyle = {
        fontSize: 9,
        color: theme.colors.foreground,
        fontFamily: 'Times-Bold',
    };

    return (
        <Document>
            <Page size="A4" style={pageStyle}>
                {/* Header */}
                <View style={headerStyle}>
                    <Heading level={1} transform="uppercase">
                        {user.fullName}
                    </Heading>
                    <View style={contactRowStyle}>
                        {user.email && <PDFText style={contactItemStyle}>{user.email}</PDFText>}
                        {user.phone && <PDFText style={contactItemStyle}>• {user.phone}</PDFText>}
                        {user.address && <PDFText style={contactItemStyle}>• {user.address}</PDFText>}
                        {user.website && (
                            <PDFText style={contactItemStyle}>
                                • <Link src={user.website} style={{ color: theme.colors.foreground, textDecoration: 'none' }}>
                                    {user.website.replace(/^https?:\/\//, '')}
                                </Link>
                            </PDFText>
                        )}
                        {user.linkedin && (
                            <PDFText style={contactItemStyle}>
                                • <Link src={user.linkedin} style={{ color: theme.colors.foreground, textDecoration: 'none' }}>
                                    LinkedIn
                                </Link>
                            </PDFText>
                        )}
                        {user.github && (
                            <PDFText style={contactItemStyle}>
                                • <Link src={user.github} style={{ color: theme.colors.foreground, textDecoration: 'none' }}>
                                    GitHub
                                </Link>
                            </PDFText>
                        )}
                    </View>
                </View>

                {/* Professional Summary */}
                {user.bio && (
                    <Section spacing="lg">
                        <Heading level={2} transform="uppercase">
                            Professional Summary
                        </Heading>
                        <Divider spacing="xs" thickness="thin" />
                        <Text variant="sm" style={descriptionStyle}>
                            {user.bio}
                        </Text>
                    </Section>
                )}

                {/* Work Experience */}
                {user.experiences && user.experiences.length > 0 && (
                    <Section spacing="lg">
                        <Heading level={2} transform="uppercase">
                            Work Experience
                        </Heading>
                        <Divider spacing="xs" thickness="thin" />
                        {user.experiences.map((exp, index) => (
                            <View key={index} style={itemContainerStyle}>
                                <View style={titleRowStyle}>
                                    <PDFText style={titleStyle}>{exp.title}</PDFText>
                                    <PDFText style={dateStyle}>
                                        {formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}
                                    </PDFText>
                                </View>
                                <View style={subtitleRowStyle}>
                                    <PDFText style={companyStyle}>{exp.company}</PDFText>
                                    {exp.location && <PDFText style={locationStyle}>{exp.location}</PDFText>}
                                </View>
                                {exp.description && (
                                    <PDFText style={descriptionStyle}>{exp.description}</PDFText>
                                )}
                            </View>
                        ))}
                    </Section>
                )}

                {/* Internships */}
                {user.internships && user.internships.length > 0 && (
                    <Section spacing="lg">
                        <Heading level={2} transform="uppercase">
                            Internships
                        </Heading>
                        <Divider spacing="xs" thickness="thin" />
                        {user.internships.map((intern, index) => (
                            <View key={index} style={itemContainerStyle}>
                                <View style={titleRowStyle}>
                                    <PDFText style={titleStyle}>{intern.title}</PDFText>
                                    <PDFText style={dateStyle}>
                                        {formatDate(intern.startDate)} – {intern.current ? "Present" : formatDate(intern.endDate)}
                                    </PDFText>
                                </View>
                                <View style={subtitleRowStyle}>
                                    <PDFText style={companyStyle}>{intern.company}</PDFText>
                                    {intern.location && <PDFText style={locationStyle}>{intern.location}</PDFText>}
                                </View>
                                {intern.description && (
                                    <PDFText style={descriptionStyle}>{intern.description}</PDFText>
                                )}
                            </View>
                        ))}
                    </Section>
                )}

                {/* Education */}
                {user.education && user.education.length > 0 && (
                    <Section spacing="lg">
                        <Heading level={2} transform="uppercase">
                            Education
                        </Heading>
                        <Divider spacing="xs" thickness="thin" />
                        {user.education.map((edu, index) => (
                            <View key={index} style={itemContainerStyle}>
                                <View style={titleRowStyle}>
                                    <PDFText style={titleStyle}>{edu.school}</PDFText>
                                    <PDFText style={dateStyle}>
                                        {formatDate(edu.startDate)} – {edu.endDate ? formatDate(edu.endDate) : "Present"}
                                    </PDFText>
                                </View>
                                <View style={subtitleRowStyle}>
                                    <PDFText style={companyStyle}>{edu.degree}</PDFText>
                                    {edu.location && <PDFText style={locationStyle}>{edu.location}</PDFText>}
                                </View>
                                {edu.activities && (
                                    <PDFText style={descriptionStyle}>Activities: {edu.activities}</PDFText>
                                )}
                            </View>
                        ))}
                    </Section>
                )}

                {/* Skills */}
                {user.skills && user.skills.length > 0 && (
                    <Section spacing="lg">
                        <Heading level={2} transform="uppercase">
                            Skills
                        </Heading>
                        <Divider spacing="xs" thickness="thin" />
                        <View style={skillsRowStyle}>
                            {Array.isArray(user.skills) ? (
                                user.skills.map((skill, index) => (
                                    <PDFText key={index} style={skillItemStyle}>
                                        {skill}{index < user.skills.length - 1 ? " • " : ""}
                                    </PDFText>
                                ))
                            ) : (
                                <PDFText style={skillItemStyle}>{user.skills}</PDFText>
                            )}
                        </View>
                    </Section>
                )}

                {/* Projects */}
                {user.projects && user.projects.length > 0 && (
                    <Section spacing="lg">
                        <Heading level={2} transform="uppercase">
                            Projects
                        </Heading>
                        <Divider spacing="xs" thickness="thin" />
                        {user.projects.map((project, index) => (
                            <View key={index} style={itemContainerStyle}>
                                <View style={titleRowStyle}>
                                    <PDFText style={titleStyle}>{project.name}</PDFText>
                                    {(project.startDate || project.endDate) && (
                                        <PDFText style={dateStyle}>
                                            {formatDate(project.startDate)} – {formatDate(project.endDate)}
                                        </PDFText>
                                    )}
                                </View>
                                {project.description && (
                                    <PDFText style={descriptionStyle}>{project.description}</PDFText>
                                )}
                                {project.url && (
                                    <Link src={project.url} style={{ fontSize: 9, color: theme.colors.mutedForeground }}>
                                        {project.url}
                                    </Link>
                                )}
                            </View>
                        ))}
                    </Section>
                )}

                {/* Certifications */}
                {user.certifications && user.certifications.length > 0 && (
                    <Section spacing="lg">
                        <Heading level={2} transform="uppercase">
                            Certifications
                        </Heading>
                        <Divider spacing="xs" thickness="thin" />
                        {user.certifications.map((cert, index) => (
                            <View key={index} style={{ marginBottom: theme.spacing.sm }}>
                                <View style={titleRowStyle}>
                                    <PDFText style={titleStyle}>{cert.name}</PDFText>
                                    <PDFText style={dateStyle}>{formatDate(cert.issueDate)}</PDFText>
                                </View>
                                <PDFText style={companyStyle}>{cert.issuer}</PDFText>
                                {cert.credentialID && (
                                    <PDFText style={descriptionStyle}>ID: {cert.credentialID}</PDFText>
                                )}
                            </View>
                        ))}
                    </Section>
                )}

                {/* Awards */}
                {user.awards && user.awards.length > 0 && (
                    <Section spacing="lg">
                        <Heading level={2} transform="uppercase">
                            Awards
                        </Heading>
                        <Divider spacing="xs" thickness="thin" />
                        {user.awards.map((award, index) => (
                            <View key={index} style={{ marginBottom: theme.spacing.sm }}>
                                <View style={titleRowStyle}>
                                    <PDFText style={titleStyle}>{award.title}</PDFText>
                                    <PDFText style={dateStyle}>{formatDate(award.date)}</PDFText>
                                </View>
                                <PDFText style={companyStyle}>{award.issuer}</PDFText>
                                {award.description && (
                                    <PDFText style={descriptionStyle}>{award.description}</PDFText>
                                )}
                            </View>
                        ))}
                    </Section>
                )}

                {/* Languages */}
                {user.languages && user.languages.length > 0 && (
                    <Section spacing="lg">
                        <Heading level={2} transform="uppercase">
                            Languages
                        </Heading>
                        <Divider spacing="xs" thickness="thin" />
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
                            {user.languages.map((lang, index) => (
                                <PDFText key={index} style={{ fontSize: 10 }}>
                                    <PDFText style={{ fontFamily: 'Times-Bold' }}>{lang.language}</PDFText>
                                    <PDFText> ({lang.proficiency})</PDFText>
                                </PDFText>
                            ))}
                        </View>
                    </Section>
                )}
            </Page>
        </Document>
    );
};

export default ResumePDFx;
