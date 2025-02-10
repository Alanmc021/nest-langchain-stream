/**
 * 📝 Exemplo de Backend - NestJS com LangChain e OpenAI
 *
 * Este controlador fornece endpoints para:
 * 1️⃣ `POST /langchain/configurar_peca` - Gera uma petição inicial baseada em um prompt.
 * 2️⃣ `POST /langchain/stream` - Retorna respostas em **streaming** usando LangChain e OpenAI.
 *
 * Tecnologias utilizadas:
 * ✅ NestJS
 * ✅ LangChain
 * ✅ OpenAI API
 * ✅ Streaming de respostas (Server-Sent Events - SSE)
 *
 * Como usar:
 * - Para utilizar o streaming, faça uma requisição POST com um corpo JSON:
 *   `{ "prompt": "Seu texto aqui" }`
 *
 * 🚀 Autor: Alan Martins
 */

import { Controller, Get, Query, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { LangchainService } from './langchain.service';
import { PETICAO_INICAL_CONSTRUTOR } from '../prompt/peticao-inicial';
import { OpenAI, ChatOpenAI } from '@langchain/openai';

@Controller('langchain')
export class LangchainController {
  private readonly openai: OpenAI;
  private readonly chatModel: ChatOpenAI;

  constructor(private readonly langchainService: LangchainService) { 
    this.openai = new OpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature: 0.7,
      maxTokens: 500,
    });

    this.chatModel = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      streaming: true, // Ativar streaming
    });
  }

  @Post('configurar_peca')
  async generate(@Body('prompt') prompt: string): Promise<any> {
    if (!prompt) {
      return { error: 'Please provide a prompt!' };
    }
    const cleanPrompt = prompt.trim();
    const formattedPrompt = PETICAO_INICAL_CONSTRUTOR.replace('{input}', cleanPrompt);

    try {
      const response = await this.langchainService.configurarPeca(formattedPrompt);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Post('stream')
  async streamResponse(@Body('prompt') prompt: string, @Res() res: Response): Promise<void> {
    if (!prompt) {
      res.status(400).json({ error: 'Please provide a prompt!' });
      return;
    }

    const cleanPrompt = prompt.trim();

    // Configuração dos headers para streaming SSE (Server-Sent Events)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // Garante que os headers sejam enviados imediatamente

    try {
      await this.chatModel.call(
        [{ role: 'user', content: cleanPrompt }],
        {
          callbacks: [
            {
              handleLLMNewToken(token: string) {
                res.write(`${token}`); // Formato SSE
                // res.write(`data: ${token}\n\n`); // Formato SSE
              },
            },
          ],
        }
      );

      res.end(); // Finaliza o stream
    } catch (error) {
      res.write(`data: {"error": "${error.message}"}\n\n`);
      res.end();
    }
  }
}
