import { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script';


export default function Document() {
    return (
      <Html>
        <Head>
          <link rel="icon" href="/favicon.ico" />
          
          <noscript>
            {/* TODO: Alt text or skip alt text error in eslint. Also, what is this? */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=340533780623242&ev=PageView&noscript=1`}
              alt="tracker"
            />
          </noscript>

          {/* Global Site Tag (gtag.js) - Google Analytics */}
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
          />

          <Script
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                            (function(s) {
                            s=document.createElement('script'); s.async=true;
                            s.dataset.clientKey="sdk-09TvTBUc2phrLe";
                            s.src="https://cdn.jsdelivr.net/npm/@growthbook/growthbook/dist/bundles/auto.min.js";
                            document.head.appendChild(s);
                            })();
                        `,
            }}
          />

          <Script
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                            window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            gtag('js', new Date());
                            gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}', {
                                page_path: window.location.pathname,
                            });
                            gtag('config', 'AW-11474351176');
                        `,
            }}
          />

          <Script
            strategy="lazyOnLoad"
            dangerouslySetInnerHTML={{
              __html: `
                            !function(f,b,e,v,n,t,s)
                            {if(f.fbq)return;n=f.fbq=function(){n.callMethod ?
                                n.callMethod.apply(n, arguments) : n.queue.push(arguments)};
                            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                            n.queue=[];t=b.createElement(e);t.async=!0;
                            t.src=v;s=b.getElementsByTagName(e)[0];
                            s.parentNode.insertBefore(t,s)}(window, document,'script',
                            'https://connect.facebook.net/en_US/fbevents.js');
                            fbq('init', '340533780623242');
                            fbq('track', 'PageView');
                        `,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
}
                
                
                        

              
                
            