import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html>
            <Head>
                <noscript>
                    {/* TODO: Alt text or skip alt text error in eslint. Also, what is this? */}
                    <img
                        height="1"
                        width="1"
                        style={{ display: 'none' }}
                        src={`https://www.facebook.com/tr?id=340533780623242&ev=PageView&noscript=1`}
                        alt="tracker"
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
                    rel="preload"
                    as="style"
                    href="https://fonts.googleapis.com/css2?family=Fira+Code&family=Inter&family=Space+Grotesk&display=optional"
                />
           
                <link
                    rel="preload"
                    href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;600&family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600&display=swap"
                    as="style"
                />
                    
                    

                
                
            </Head>
            <body>
                
                <Main />
                
                <NextScript />
                
            </body>
        </Html>
    )
}