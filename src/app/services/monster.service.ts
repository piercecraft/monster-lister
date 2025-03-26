// src/app/services/monster.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Monster } from '../models/monster.type';

@Injectable({
  providedIn: 'root',
})
export class MonsterService {
  private monstersUrl = '/assets/monsters.json';

  constructor(private http: HttpClient) {}

  getMonsters(): Observable<Monster[]> {
    return this.http.get<Monster[]>(this.monstersUrl);
  }
}