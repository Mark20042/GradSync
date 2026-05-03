// PDFx Theme Configuration for ATS-Friendly Resumes
export interface PdfxTheme {
    name: string;
    colors: {
        primary: string;
        accent: string;
        foreground: string;
        background: string;
        muted: string;
        mutedForeground: string;
        primaryForeground: string;
        border: string;
        destructive: string;
        success: string;
        warning: string;
        info: string;
    };
    typography: {
        heading: {
            fontFamily: string;
            fontWeight: number;
            lineHeight: number;
            fontSize: {
                h1: number;
                h2: number;
                h3: number;
                h4: number;
                h5: number;
                h6: number;
            };
        };
        body: {
            fontFamily: string;
            fontSize: number;
            lineHeight: number;
        };
    };
    spacing: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
    };
    primitives: {
        borderRadius: number;
        borderWidth: number;
    };
    page: {
        padding: number;
        size: string;
    };
}

export const theme: PdfxTheme = {
    name: 'ats-professional',
    colors: {
        primary: '#111827', // gray-900 - ATS-friendly dark text
        accent: '#374151', // gray-700
        foreground: '#1f2937', // gray-800
        background: '#ffffff',
        muted: '#f9fafb', // gray-50
        mutedForeground: '#6b7280', // gray-500
        primaryForeground: '#ffffff',
        border: '#d1d5db', // gray-300
        destructive: '#dc2626',
        success: '#16a34a',
        warning: '#d97706',
        info: '#0ea5e9',
    },
    typography: {
        heading: {
            fontFamily: 'Times-Bold',
            fontWeight: 700,
            lineHeight: 1.2,
            fontSize: {
                h1: 24, // Name
                h2: 12, // Section titles
                h3: 11, // Job titles
                h4: 10,
                h5: 9,
                h6: 9,
            },
        },
        body: {
            fontFamily: 'Times-Roman',
            fontSize: 10,
            lineHeight: 1.5,
        },
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
    },
    primitives: {
        borderRadius: 0, // ATS systems prefer no rounded corners
        borderWidth: 1,
    },
    page: {
        padding: 40,
        size: 'A4',
    },
};
