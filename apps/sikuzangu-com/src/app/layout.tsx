import './global.css';
import {ReactNode} from "react";

export default function RootLayout({children,}: { children: ReactNode; }) {
    return (
        <html lang="en">
        <body className='w-full h-screen bg-white font-display'>
        {children}
        </body>
        </html>
    );
}
