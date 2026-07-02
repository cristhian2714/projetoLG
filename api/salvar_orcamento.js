const SUPABASE_URL = 'https://lcxasbtnbfgzisubheak.supabase.co';
const SUPABASE_KEY = 'sb_publishable_3pK_BWrx5IcP3VTgHSKGAw_01ZqVfuN';

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
    const response = await fetch(`${SUPABASE_URL}/rest/v1/orcamentos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      return res.status(200).json({
        success: true,
        message: 'Solicitação de orçamento cadastrada com sucesso!'
      });
    } else {
      const errorText = await response.text();
      return res.status(500).json({
        success: false,
        message: 'Erro ao salvar no banco de dados.',
        details: errorText
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor.',
      details: error.message
    });
  }
}
