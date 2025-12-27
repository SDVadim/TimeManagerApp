import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function generateTaskSolution(taskTitle: string, taskNotes?: string): Promise<string> {
  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      return 'Для использования AI-решений необходимо настроить OPENAI_API_KEY в файле .env';
    }

    const prompt = `Ты - помощник для студентов. Тебе дана задача: "${taskTitle}"${
      taskNotes ? `\n\nДополнительная информация: ${taskNotes}` : ''
    }\n\nПредложи краткое решение или план действий для выполнения этой задачи. Ответь на русском языке, будь кратким и конкретным.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Ты - умный помощник для студентов, который помогает планировать и решать учебные задачи.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || 'Не удалось сгенерировать решение';
  } catch (error: any) {
    console.error('OpenAI API error:', error);

    return `Ой, ошибка подключения к AI!`;
  }
}

