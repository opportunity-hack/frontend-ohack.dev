import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html>
            <Head>
                <noscript>
                    <img
                        height="1"
                        width="1"
                        style={{ display: 'none' }}
                        src={`https://www.facebook.com/tr?id=340533780623242&ev=PageView&noscript=1`}
                    />
                </noscript>

                {/* Global Site Tag (gtag.js) - Google Analytics */}
                <script
                    async
                    src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
                />
                <script
                            dangerouslySetInnerHTML={{
                                __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}', {
                    page_path: window.location.pathname,
                    });
                `,
                            }}
                />
                        
                
                <script dangerouslySetInnerHTML={{
                    __html: `!function(f,b,e,v,n,t,s)
                    {if(f.fbq)return;n=f.fbq=function(){n.callMethod ?
                        n.callMethod.apply(n, arguments) : n.queue.push(arguments)};
                    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                    n.queue=[];t=b.createElement(e);t.async=!0;
                    t.src=v;s=b.getElementsByTagName(e)[0];
                    s.parentNode.insertBefore(t,s)}(window, document,'script',
                    'https://connect.facebook.net/en_US/fbevents.js');
                    fbq('init', '340533780623242');
                    fbq('track', 'PageView');`
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


                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                <link
                    rel="preload"
                    as="style"
                    href="https://fonts.googleapis.com/css2?family=Fira+Code&family=Inter&family=Space+Grotesk&display=optional"
                />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Fira+Code&family=Inter&family=Space+Grotesk&display=swap"
                    media="print"
                    onLoad="this.media='all'"
                />
                <link rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,600,1,0" />

                <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />

                <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
                <link href= "https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700;800&display=swap" rel="stylesheet"/>
                <link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap" rel="stylesheet" />
                <link href="https://fonts.gstatic.com/s/productsans/v5/HYvgU2fE2nRJvZ5JFAumwegdm0LZdjqr5-oayXSOefg.woff2" rel="stylesheet"/>
                <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Roboto+Mono:wght@700&display=swap" rel="stylesheet"/>
                
            </Head>
            <body>
                
                <Main />
                
                <NextScript />
                
            </body>
        </Html>
    )
}