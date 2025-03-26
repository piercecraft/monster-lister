import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MonsterSearchComponent } from "./components/monster-search/monster-search.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MonsterSearchComponent],
  template: `
    <app-monster-search />
    <router-outlet />
  `,
  styles: [],
})
export class AppComponent {
  title = 'monster-lister';
}
