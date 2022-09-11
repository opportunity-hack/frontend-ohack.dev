import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html>
            <Head>
                {/* <!-- Google tag (gtag.js) --> */}
                <script async src="https://www.googletagmanager.com/gtag/js?id=G-EM3BV6M5EF"></script>
                <script dangerouslySetInnerHTML={{
                    __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag() {dataLayer.push(arguments); }
                    gtag('js', new Date());

                    gtag('config', 'G-EM3BV6M5EF');
                    `,
                    }}
                />
              
                <link
                    rel="shortcut icon mask-icon"
                    href="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/volunteer_activism/wght500grad200fill1/48px.svg"
                    color="#CBC3E3"
                />
                <link
                    rel="shortcut icon"
                    href="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/volunteer_activism/wght500grad200fill1/48px.svg"
                />


                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
                <link
                    rel="preload"
                    as="style"
                    href="https://fonts.googleapis.com/css2?family=Fira+Code&family=Inter&family=Space+Grotesk&display=optional"
                />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Fira+Code&family=Inter&family=Space+Grotesk&display=swap"
                    media="print"
                    onload="this.media='all'"
                />
                <link rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,600,1,0" />

                <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
                
            </Head>
            <body>
                
                <Main />
                
                <NextScript />
                
            </body>
        </Html>
    )
}