const SUPABASE_URL = 'https://lcxasbtnbfgzisubheak.supabase.co';
const SUPABASE_KEY = 'sb_publishable_3pK_BWrx5IcP3VTgHSKGAw_01ZqVfuN';
const BREVO_KEY = process.env.BREVO_API_KEY;

export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { nome, email, telefone, servico, necessidade } = req.body || {};

  if (!nome || !email) {
    return res.status(400).json({
      success: false,
      message: 'Nome e E-mail são obrigatórios.'
    });
  }

  const data = {
    nome_completo: nome,
    email: email,
    telefone: telefone || null,
    servico_interesse: servico || null,
    necessidade: necessidade || null
  };

  try {
    // 1. Save to Supabase
    const dbResponse = await fetch(`${SUPABASE_URL}/rest/v1/orcamentos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(data)
    });

    if (!dbResponse.ok) {
      const errorText = await dbResponse.text();
      console.error('Supabase error:', errorText);
    }

    // 2. Send email via Brevo if key is configured
    if (BREVO_KEY) {
      try {
        const emailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': BREVO_KEY,
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            sender: {
              name: "Website LG Serviços",
              email: "lopesegomes.limpeza@gmail.com"
            },
            to: [
              {
                email: "lopesegomes.limpeza@gmail.com",
                name: "LG Serviços"
              }
            ],
            replyTo: {
              email: email,
              name: nome
            },
            subject: `Nova Solicitação de Orçamento - ${nome}`,
            htmlContent: `
              <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                <h2 style="color: #0D2B55; border-bottom: 2px solid #1B7A4C; padding-bottom: 8px;">Nova Solicitação de Orçamento Recebida</h2>
                <p><strong>Nome Completo:</strong> ${nome}</p>
                <p><strong>E-mail:</strong> ${email}</p>
                <p><strong>Telefone:</strong> ${telefone || 'Não informado'}</p>
                <p><strong>Serviço de Interesse:</strong> ${servico || 'Não informado'}</p>
                <p><strong>Mensagem/Necessidade:</strong></p>
                <div style="background: #F7F8FA; padding: 15px; border-left: 4px solid #1B7A4C; border-radius: 4px; margin-top: 10px;">
                  ${(necessidade || 'Nenhuma descrição detalhada enviada.').replace(/\n/g, '<br>') || ''}
                </div>
              </div>
            `
          })
        });

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          console.error('Brevo email sending error:', errorText);
        }
      } catch (emailErr) {
        console.error('Failed to trigger Brevo request:', emailErr);
      }
    } else {
      console.warn('BREVO_API_KEY environment variable is not defined.');
    }

    return res.status(200).json({
      success: true,
      message: 'Solicitação de orçamento cadastrada com sucesso!'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor.',
      details: error.message
    });
  }
}
