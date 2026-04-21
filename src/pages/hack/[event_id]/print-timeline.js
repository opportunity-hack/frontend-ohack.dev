import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { format, differenceInMilliseconds, differenceInHours } from 'date-fns';
import ReactMarkdown from 'react-markdown';

const PrintTimelinePage = () => {
  const router = useRouter();
  const { event_id } = router.query;
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (event_id) {
      fetchEventData();
    }
  }, [event_id]);

  useEffect(() => {
    // Auto-print when page loads
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.print();
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const fetchEventData = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${event_id}`);
      const data = await response.json();
      setEventData(data);
    } catch (error) {
      console.error('Failed to fetch event data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = (url) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(url)}`;
  };

  if (loading || !eventData) {
    return <div style={{padding: '50px', textAlign: 'center'}}>Loading timeline...</div>;
  }

  const eventUrl = `https://www.ohack.dev/hack/${event_id}`;
  const sortedEvents = eventData.countdowns ?
    [...eventData.countdowns].sort((a, b) =>
      differenceInMilliseconds(new Date(a.time), new Date(b.time))
    ) : [];

  // Calculate actual hackathon duration from first to last event
  const hackathonDuration = sortedEvents.length > 0 ?
    differenceInHours(new Date(sortedEvents[sortedEvents.length - 1].time), new Date(sortedEvents[0].time)) : 0;

  return (
    <>
      <Head>
        <title>{eventData.title} - Printable Timeline</title>
        <style>{`
          @media print {
            @page { 
              margin: 0.5in 0.5in 0.5in 0.5in; 
              size: letter;
            }
            .no-print { display: none !important; }
            body { 
              font-family: Arial, sans-serif; 
              color: black; 
              margin: 0;
              padding: 0;
            }
            .header {
              margin-top: 0 !important;              
              page-break-inside: avoid;
            }
          }
          
          * {
            box-sizing: border-box;
          }
          
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0.5in;
            line-height: 1.3;
            color: #000;
            font-size: 12px;
          }
          
          .header {
            text-align: center;
            border: 2px solid #000;
            padding: 10px;
            margin: 5px 0 10px 0;
            background: white;
            page-break-inside: avoid;
          }
          
          .header h1 {
            font-size: 20px;
            font-weight: bold;
            margin: 0 0 8px 0;
            color: #000;
            word-wrap: break-word;
            overflow-wrap: break-word;
            white-space: normal;
          }
          
          .header h2 {
            font-size: 14px;
            font-weight: bold;
            margin: 0 0 10px 0;
            color: #000;
          }
          
          .event-info {
            font-size: 11px;
            color: #000;
          }
          
          .main-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 5px;
          }
          
          .timeline-section {
            grid-column: 1 / -1;
          }
          
          .compact-section {
            background: white;
            border: 1px solid #ccc;
            padding: 10px;
            margin-bottom: 10px;
          }
          
          .compact-section h3 {
            font-size: 13px;
            font-weight: bold;
            margin: 0 0 8px 0;
            color: #000;
            border-bottom: 1px solid #000;
            padding-bottom: 3px;
          }
          
          .compact-section p {
            margin: 3px 0;
            font-size: 10px;
            line-height: 1.2;
          }
          
          .timeline-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-bottom: 15px;
          }
          
          .event-item {
            border: 1px solid #ddd;
            padding: 8px;
            background: white;
            page-break-inside: avoid;
            position: relative;
          }
          
          .event-number {
            position: absolute;
            top: -8px;
            left: -8px;
            background: #1976d2;
            color: white;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: bold;
            border: 2px solid white;
          }
          
          .footer {
            text-align: center;
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px solid #000;
            font-size: 9px;
            color: #666;
          }
          
          @media print {
            .main-grid {
              display: block;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 8px;
            }
            .timeline-grid {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 6px;
            }
            .qr-code {
              position: absolute;
              bottom: 10px;
              right: 10px;
            }
            .qr-code img {
              width: 60px;
              height: 60px;
            }
          }
        `}</style>
      </Head>

      <div className="header">
        <h1>{eventData.title}</h1>
        <h2>Event Timeline & Information</h2>
        <div className="event-info">
          📅 {format(new Date(eventData.start_date), 'MMM dd')} - {format(new Date(eventData.end_date), 'MMM dd, yyyy')} |
          📍 {eventData.location || 'Location TBA'} |
          🆔 {event_id} |
          ⏱️ {hackathonDuration}h hackathon
        </div>
      </div>

      <div className="main-grid">
        <div className="timeline-section">
          <div className="compact-section">
            <h3>📅 Event Timeline ({sortedEvents.length} events • {hackathonDuration}h total)</h3>
            <div className="timeline-grid">
              {sortedEvents.map((event, index) => {
                const eventTime = new Date(event.time);

                return (
                  <div key={event.name} className="event-item">
                    <div className="event-number">{index + 1}</div>
                    <div className="event-name">{event.name}</div>
                    <div className="event-time">
                      {format(eventTime, 'MMM dd • EEE h:mm a')}
                    </div>
                    {event.description && (
                      <div style={{marginTop: '5px', fontSize: '9px', lineHeight: '1.2', color: '#555'}}>
                        <ReactMarkdown>{event.description}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="info-grid">
          <div className="compact-section">
            <h3>🚗 Parking</h3>
            <p><strong>Main lot:</strong> Free behind building</p>
            <p><strong>Street:</strong> Weekends only</p>
            <p><strong>Overflow:</strong> Shopping center (5min)</p>
            <p style={{color: '#d32f2f'}}><strong>⚠️ Validation required at registration!</strong></p>
          </div>

          <div className="compact-section">
            <h3>📶 WiFi</h3>
            <p><strong>Network:</strong> OppHack-Guest</p>
            <p><strong>Password:</strong> TechForGood2024</p>
            <p>🍕 Food provided | 🏥 First aid: 2nd floor</p>
          </div>

          <div className="compact-section">
            <h3>🎯 Check-in Locations</h3>
            <p><strong>Hackers:</strong> Main entrance (30min early)</p>
            <p><strong>Mentors:</strong> 3rd floor lounge</p>
            <p><strong>Judges:</strong> Brief at 2PM Sun</p>
            <p><strong>Volunteers:</strong> Coordination desk</p>
          </div>

          <div className="compact-section">
            <h3>💼 What to Bring</h3>
            <p><strong>Hackers:</strong> Laptop + charger + ID</p>
            <p><strong>Mentors:</strong> Business cards + expertise</p>
            <p><strong>Judges:</strong> Scoring criteria provided</p>
            <p><strong>All:</strong> Comfortable clothes + enthusiasm!</p>
          </div>

          <div className="compact-section">
            <h3>🏆 Judging Process</h3>
            <p><strong>Demo:</strong> 3min presentation</p>
            <p><strong>Q&A:</strong> 2min questions</p>
            <p><strong>Criteria:</strong> Impact, tech, design, pitch</p>
            <p><strong>Winners:</strong> Announced at closing</p>
          </div>

          <div className="compact-section">
            <h3>📋 Event Rules</h3>
            <p>• Teams: 2-6 people max</p>
            <p>• Code: Start fresh at kickoff</p>
            <p>• APIs: Any public APIs allowed</p>
            <p>• Submit: GitHub repo + demo video</p>
          </div>
        </div>
      </div>

      <div className="emergency-section">
        <h3>🚨 Emergency Contacts</h3>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', fontSize: '10px'}}>
          <div><strong>Event Organizers:</strong><br/>+1 (555) 123-HACK</div>
          <div><strong>Security:</strong><br/>+1 (555) 911-HELP</div>
          <div><strong>Medical Emergency:</strong><br/>911</div>
          <div><strong>Building Security:</strong><br/>+1 (555) 888-BLDG</div>
        </div>
      </div>

      <div className="footer">
        Generated from ohack.dev • For updates visit: {eventUrl}<br/>
        Printed on {format(new Date(), 'MMMM do, yyyy \'at\' h:mm a')}
      </div>

      <div className="qr-code no-print">
        <img
          src={generateQRCode(eventUrl)}
          alt={`QR code for ${eventUrl}`}
          width={120}
          height={120}
          style={{ maxWidth: '120px', height: 'auto' }}
        />
        <div style={{fontSize: '12px', marginTop: '5px'}}>
          Scan for live updates
        </div>
      </div>
    </>
  );
};

export default PrintTimelinePage;