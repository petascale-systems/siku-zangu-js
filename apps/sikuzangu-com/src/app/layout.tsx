import './global.css';
import {ReactNode} from "react";

export const metadata = {
    title: 'Siku Zangu',
    description: 'Africa\'s best menstrual health app',
};

export default function RootLayout({children,}: { children: ReactNode; }) {
    return (
        <html lang="en">
        <body className='w-screen h-screen bg-white font-display'>{children}</body>
        </html>
    );
}
