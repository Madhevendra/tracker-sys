
export interface Theme {
    name: string;
    colors: {
        background: string;
        foreground: string;
        card: string;
        'card-foreground': string;
        popover: string;
        'popover-foreground': string;
        primary: string;
        'primary-foreground': string;
        secondary: string;
        'secondary-foreground': string;
        muted: string;
        'muted-foreground': string;
        accent: string;
        'accent-foreground': string;
        destructive: string;
        'destructive-foreground': string;
        border: string;
        input: string;
        ring: string;
    };
}

export const themes: Theme[] = [
    {
        name: 'Default',
        colors: {
            background: '60 56% 91%',
            foreground: '20 14.3% 4.1%',
            card: '60 56% 91%',
            'card-foreground': '20 14.3% 4.1%',
            popover: '60 56% 91%',
            'popover-foreground': '20 14.3% 4.1%',
            primary: '90 98% 55%',
            'primary-foreground': '90 100% 20%',
            secondary: '60 4.8% 95.9%',
            'secondary-foreground': '24 9.8% 10%',
            muted: '60 4.8% 95.9%',
            'muted-foreground': '25 5.3% 44.7%',
            accent: '285 87% 53%',
            'accent-foreground': '0 0% 98%',
            destructive: '0 84.2% 60.2%',
            'destructive-foreground': '0 0% 98%',
            border: '20 5.9% 90%',
            input: '20 5.9% 90%',
            ring: '285 87% 53%',
        }
    },
    {
        name: 'Forest',
        colors: {
            background: '120 10% 95%',
            foreground: '120 25% 15%',
            card: '120 10% 95%',
            'card-foreground': '120 25% 15%',
            popover: '120 10% 95%',
            'popover-foreground': '120 25% 15%',
            primary: '140 60% 45%',
            'primary-foreground': '140 25% 95%',
            secondary: '120 15% 90%',
            'secondary-foreground': '120 25% 25%',
            muted: '120 15% 90%',
            'muted-foreground': '120 15% 45%',
            accent: '40 80% 60%',
            'accent-foreground': '40 30% 15%',
            destructive: '0 70% 50%',
            'destructive-foreground': '0 0% 100%',
            border: '120 10% 85%',
            input: '120 10% 85%',
            ring: '140 60% 45%',
        }
    },
    {
        name: 'Ocean',
        colors: {
            background: '210 30% 96%',
            foreground: '220 30% 20%',
            card: '210 30% 96%',
            'card-foreground': '220 30% 20%',
            popover: '210 30% 96%',
            'popover-foreground': '220 30% 20%',
            primary: '220 80% 60%',
            'primary-foreground': '210 50% 98%',
            secondary: '210 25% 92%',
            'secondary-foreground': '220 25% 30%',
            muted: '210 25% 92%',
            'muted-foreground': '220 20% 50%',
            accent: '190 85% 55%',
            'accent-foreground': '210 50% 98%',
            destructive: '0 80% 60%',
            'destructive-foreground': '0 0% 100%',
            border: '210 20% 88%',
            input: '210 20% 88%',
            ring: '220 80% 60%',
        }
    },
    {
        name: 'Sunset',
        colors: {
            background: '20 50% 98%',
            foreground: '20 30% 15%',
            card: '20 50% 98%',
            'card-foreground': '20 30% 15%',
            popover: '20 50% 98%',
            'popover-foreground': '20 30% 15%',
            primary: '30 90% 60%',
            'primary-foreground': '20 50% 10%',
            secondary: '20 40% 94%',
            'secondary-foreground': '20 30% 25%',
            muted: '20 40% 94%',
            'muted-foreground': '20 20% 50%',
            accent: '350 90% 65%',
            'accent-foreground': '0 0% 100%',
            destructive: '0 80% 60%',
            'destructive-foreground': '0 0% 100%',
            border: '20 30% 90%',
            input: '20 30% 90%',
            ring: '30 90% 60%',
        }
    }
];
