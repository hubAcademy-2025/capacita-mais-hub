import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteEmailRequest {
  name: string;
  email: string;
  role: string;
  invitedBy: string;
}

const getRoleName = (role: string) => {
  switch (role) {
    case 'admin':
      return 'Administrador';
    case 'professor':
      return 'Professor';
    case 'aluno':
      return 'Aluno';
    default:
      return role;
  }
};

const createInviteEmailHTML = (name: string, role: string, invitedBy: string, inviteUrl: string) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Convite para Capacita+</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
        .header p { color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; color: #333; margin-bottom: 20px; }
        .message { color: #666; line-height: 1.6; margin-bottom: 30px; font-size: 16px; }
        .role-badge { display: inline-block; background-color: #667eea; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 500; margin: 10px 0; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: 500; margin: 20px 0; font-size: 16px; }
        .cta-button:hover { transform: translateY(-1px); }
        .footer { background-color: #f8f9fa; padding: 20px 30px; text-align: center; color: #666; font-size: 14px; }
        .divider { height: 1px; background-color: #e0e0e0; margin: 30px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 Capacita+</h1>
          <p>Plataforma de Educação Online</p>
        </div>
        
        <div class="content">
          <h2 class="greeting">Olá, ${name}!</h2>
          
          <p class="message">
            Você foi convidado por <strong>${invitedBy}</strong> para participar da plataforma <strong>Capacita+</strong> 
            como <span class="role-badge">${role}</span>.
          </p>
          
          <p class="message">
            O Capacita+ é uma plataforma moderna de educação online que oferece trilhas de aprendizado, 
            encontros virtuais e ferramentas de acompanhamento de progresso.
          </p>
          
          <div class="divider"></div>
          
          <p class="message">
            Para criar sua conta e começar a usar a plataforma, clique no botão abaixo:
          </p>
          
          <a href="${inviteUrl}" class="cta-button">
            Criar Minha Conta
          </a>
          
          <p class="message" style="font-size: 14px; color: #888;">
            Se o botão não funcionar, copie e cole este link no seu navegador:<br>
            <code style="background-color: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${inviteUrl}</code>
          </p>
        </div>
        
        <div class="footer">
          <p>Este convite foi enviado por ${invitedBy} através da plataforma Capacita+</p>
          <p>Se você não esperava este convite, pode ignorar este email com segurança.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-invite-email function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, role, invitedBy }: InviteEmailRequest = await req.json();
    console.log("Invite request:", { name, email, role, invitedBy });

    if (!name || !email || !role || !invitedBy) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create the invite URL (pointing to the auth page)
    const inviteUrl = `${new URL(req.url).origin}/auth?invite=true&email=${encodeURIComponent(email)}&role=${encodeURIComponent(role)}`;

    console.log("Sending email to:", email);

    try {
      const emailResponse = await resend.emails.send({
        from: "Sistema de Ensino <noreply@viralmais.marketing>",
        to: [email],
        subject: `Convite para acessar o sistema como ${getRoleName(role)}`,
        html: createInviteEmailHTML(name, getRoleName(role), invitedBy, inviteUrl),
      });

      console.log("Email sent successfully:", emailResponse);

      return new Response(
        JSON.stringify({ 
          success: true, 
          messageId: emailResponse.data?.id,
          inviteUrl 
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    } catch (emailError: any) {
      console.error("Resend email error:", emailError);
      
      // Return detailed error information
      const errorMessage = emailError.message || 'Erro desconhecido';
      let errorDetails = errorMessage;
      
      if (errorMessage.includes('domain') || errorMessage.includes('Domain')) {
        errorDetails = 'Domínio não verificado no Resend. Configure um domínio verificado em https://resend.com/domains';
      } else if (errorMessage.includes('API key')) {
        errorDetails = 'Chave da API do Resend inválida ou não configurada';
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao enviar email',
          details: errorDetails,
          originalError: errorMessage,
          inviteUrl // Still return the invite URL so admin can share manually
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }
  } catch (error: any) {
    console.error("Error in send-invite-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);