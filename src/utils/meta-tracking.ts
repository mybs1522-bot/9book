declare global {
    interface Window {
        fbq: any;
    }
}

/**
 * Generates a unique event ID for deduplication between Pixel and CAPI.
 */
const generateEventId = () => {
    return 'event-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
};

export interface MetaEventData {
    eventName: string;
    email?: string;
    value?: number;
    currency?: string;
    content_ids?: string[];
    content_type?: string;
    [key: string]: any;
}

/**
 * Tracks an event to both Meta Pixel (browser) and Meta Conversion API (server).
 */
export const trackMetaEvent = async (data: MetaEventData) => {
    const eventId = generateEventId();
    const { eventName, email, value, currency, content_ids, content_type, ...customData } = data;

    // 1. Fire Pixel Event (Browser)
    if (typeof window.fbq === 'function') {
        window.fbq('track', eventName, {
            value,
            currency,
            content_ids,
            content_type,
            ...customData
        }, { eventID: eventId });
        console.log(`[Meta Pixel] Tracked: ${eventName}`, { eventId });
    }

    // 2. Fire Conversion API Event (Server via Supabase Edge Function)
    try {
        const res = await fetch('https://dhufnozehayzjlsmnvdl.supabase.co/functions/v1/meta-events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventName,
                event_id: eventId,
                user_data: {
                    em: email ? email.toLowerCase().trim() : undefined,
                },
                custom_data: {
                    value,
                    currency,
                    content_ids,
                    content_type,
                    ...customData
                }
            })
        });

        if (!res.ok) {
            console.error('[Meta CAPI] Error:', await res.text());
        } else {
            console.log(`[Meta CAPI] Tracked: ${eventName}`, { eventId });
        }
    } catch (err) {
        console.error('[Meta CAPI] Invoke failed:', err);
    }
};
