import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  constructor(private translate: TranslateService) { }

  public setInitialLanguage(): void {
    const language = this.translate.getBrowserLang();
    console.log('language:', language);
    this.translate.setDefaultLang(language);
  }

  public useLanguage(language: string) {
    this.translate.use(language);
  }

  public translateByKey(key: string): Promise<string> {
    return this.translate.get(key).toPromise();
  }
}
