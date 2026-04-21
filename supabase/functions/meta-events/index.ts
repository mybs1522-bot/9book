import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const FB_ACCESS_TOKEN = Deno.env.get('FB_ACCESS_TOKEN')
const FB_PIXEL_ID = Deno.env.get('FB_PIXEL_ID')

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } })
    }

    try {
        const { eventName, event_id, user_data, custom_data } = await req.json()

        if (!FB_ACCESS_TOKEN || !FB_PIXEL_ID) {
            console.error('FB_ACCESS_TOKEN or FB_PIXEL_ID not set')
            return new Response(JSON.stringify({ error: 'Configuration missing' }), { status: 500 })
        }

        // Prepare payload
        const payload = {
            test_event_code: 'TEST41312', // REMOVE after testing is verified
            data: [
                {
                    event_name: eventName,
                    event_time: Math.floor(Date.now() / 1000),
                    action_source: 'website',
                    event_id: event_id,
                    event_source_url: req.headers.get('referer') || '',
                    user_data: {
                        ...user_data,
                        em: user_data.em ? [await hashString(user_data.em)] : []
                    },
                    custom_data: {
                        ...custom_data,
                        currency: custom_data.currency || 'USD',
                        value: custom_data.value || 0
                    }
                }
            ]
        }

        const response = await fetch(
            `https://graph.facebook.com/v19.0/${FB_PIXEL_ID}/events?access_token=${FB_ACCESS_TOKEN}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            }
        )

        const result = await response.json()
        console.log('[Meta CAPI Result]', result)

        return new Response(JSON.stringify(result), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            status: response.status,
        })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            status: 400,
        })
    }
})

// Helper for SHA256 hashing if needed (Deno native)
async function hashString(str: string) {
    const msgUint8 = new TextEncoder().encode(str)
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}
