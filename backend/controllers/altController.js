const https = require('https');

const generateAlt = async (req, res) => {
  try {
    const { image_base64, mime_type } = req.body;

    if (!image_base64) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        message: 'AI service not configured. Please add OPENAI_API_KEY to your .env file.'
      });
    }

    const payload = JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Generate a concise, descriptive alt text for this image in English. Keep it under 125 characters. Provide only the alt text, no extra explanation or quotes.'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mime_type || 'image/jpeg'};base64,${image_base64}`,
                detail: 'low'
              }
            }
          ]
        }
      ],
      max_tokens: 150
    });

    const options = {
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const altText = await new Promise((resolve, reject) => {
      const request = https.request(options, (response) => {
        let data = '';
        response.on('data', chunk => (data += chunk));
        response.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) return reject(new Error(parsed.error.message));
            if (parsed.choices && parsed.choices[0]) {
              resolve(parsed.choices[0].message.content.trim());
            } else {
              reject(new Error('No response from AI'));
            }
          } catch (e) {
            reject(e);
          }
        });
      });
      request.on('error', reject);
      request.write(payload);
      request.end();
    });

    res.json({ alt_text: altText });
  } catch (error) {
    console.error('Alt generation error:', error.message);
    res.status(500).json({ message: 'Failed to generate alt text: ' + error.message });
  }
};

module.exports = { generateAlt };
