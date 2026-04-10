import { Injectable } from '@nestjs/common';
import wiki from 'wikipedia-js';

@Injectable()
export class WikipediaService {
  async getArticle(articleName: string, lang: string): Promise<{ content: string }> {
    const options = {
      apiUrl: `http://${lang}.wikipedia.org/w/api.php`,
      origin: '*',
    };
    const page = await wiki.page(articleName, options);
    const content = await page.content();
    return { content: content || (await page.summary()) };
  }
}
