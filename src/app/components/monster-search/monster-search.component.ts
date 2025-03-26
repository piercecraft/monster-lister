// src/app/components/monster-search.component.ts
import { Component, OnInit } from '@angular/core';
import { MonsterService } from '../../services/monster.service';
import { Monster } from '../../models/monster.type';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-monster-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <!-- Name Search (reactive) -->
      <div style="margin-bottom: 2px;">
        <input 
          type="text" 
          [(ngModel)]="searchName" 
          (ngModelChange)="onNameSearchChange()"
          placeholder="Search by Name" 
        />
      </div>

      <!-- Filters -->
      <div style="margin-bottom: 20px;">
  <!-- Filter Toggle Button -->
  <button 
    (click)="toggleFilters()" 
    style="
      width: 100%;
      padding: 0.75rem;
      background: #3a3a3a;
      color: #d4af37;
      border: 1px solid #444;
      border-radius: 4px;
      margin-bottom: 0.5rem;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
    "
  >
    <span>Filters</span>
    <span>{{ filtersExpanded ? '▲' : '▼' }}</span>
  </button>

  <!-- Filters Container -->
  <div 
    [style.display]="filtersExpanded ? 'flex' : 'none'"
    style="
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      background: #2a2a2a;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
      border: 1px solid #3a3a3a;
    "
  >
    <!-- CR Range Slider -->
    <div style="flex: 1; min-width: 200px;">
      <label>Challenge Rating: {{formatCrDisplay(crRange[0])}} to {{formatCrDisplay(crRange[1])}}</label>
      <div style="display: flex; gap: 10px; align-items: center;">
        <input 
          type="range" 
          [min]="0" 
          [max]="crOptions.length - 1" 
          [step]="1" 
          [(ngModel)]="crMinIndex" 
          (change)="updateCrRange()"
          style="flex: 1;"
        >
        <input 
          type="range" 
          [min]="0" 
          [max]="crOptions.length - 1" 
          [step]="1" 
          [(ngModel)]="crMaxIndex" 
          (change)="updateCrRange()"
          style="flex: 1;"
        >
      </div>
    </div>

    <!-- Type Filter -->
    <div style="flex: 1; min-width: 200px;">
      <label>Type</label>
      <input 
        type="text" 
        [(ngModel)]="searchType" 
        (ngModelChange)="applyFilters()"
        placeholder="Filter by Type" 
      />
    </div>

    <!-- Alignment Filter -->
    <div style="flex: 1; min-width: 200px;">
      <label>Alignment</label>
      <select [(ngModel)]="searchAlignment" (change)="applyFilters()">
        <option value="">All Alignments</option>
        @for (alignment of alignments; track alignment) {
          <option [value]="alignment">{{alignment}}</option>
        }
      </select>
    </div>

    <!-- Habitat Filter -->
    <div style="flex: 1; min-width: 200px;">
      <label>Habitat</label>
      <input 
        type="text" 
        [(ngModel)]="searchHabitat" 
        (ngModelChange)="applyFilters()"
        placeholder="Filter by Habitat" 
      />
    </div>
  </div>
</div>

      @if (filteredMonsters.length > 0) {
        <table>
          <tr>
            <th (click)="sortTable('name')">Name 
              <span *ngIf="currentSortColumn === 'name'">{{isSortAscending ? '↑' : '↓'}}</span>
            </th>
            <th (click)="sortTable('cr')">CR
              <span *ngIf="currentSortColumn === 'cr'">{{isSortAscending ? '↑' : '↓'}}</span>
            </th>
            <th (click)="sortTable('type')">Type
              <span *ngIf="currentSortColumn === 'type'">{{isSortAscending ? '↑' : '↓'}}</span>
            </th>
            <th (click)="sortTable('alignment')">Alignment
              <span *ngIf="currentSortColumn === 'alignment'">{{isSortAscending ? '↑' : '↓'}}</span>
            </th>
            <th (click)="sortTable('habitat')">Habitat
              <span *ngIf="currentSortColumn === 'habitat'">{{isSortAscending ? '↑' : '↓'}}</span>
            </th>
            <th (click)="sortTable('initiative')">Init
              <span *ngIf="currentSortColumn === 'initiative'">{{isSortAscending ? '↑' : '↓'}}</span>
            </th>
            <th (click)="sortTable('ac')">AC
              <span *ngIf="currentSortColumn === 'ac'">{{isSortAscending ? '↑' : '↓'}}</span>
            </th>
            <th (click)="sortTable('hp')">HP
              <span *ngIf="currentSortColumn === 'hp'">{{isSortAscending ? '↑' : '↓'}}</span>
            </th>
            <th (click)="sortTable('pb')">PB
              <span *ngIf="currentSortColumn === 'pb'">{{isSortAscending ? '↑' : '↓'}}</span>
            </th>
            <th (click)="sortTable('xp')">XP
              <span *ngIf="currentSortColumn === 'xp'">{{isSortAscending ? '↑' : '↓'}}</span>
            </th>
          </tr>
          @for (monster of filteredMonsters; track monster.name) {
            <tr>
              <td>{{ monster.name }}</td>
              <td>{{ formatCrDisplay(monster.cr) }}</td>
              <td>{{ monster.type }}</td>
              <td>{{ monster.alignment }}</td>
              <td>{{ monster.habitat }}</td>
              <td>{{ monster.initiative }}</td>
              <td>{{ monster.ac }}</td>
              <td>{{ monster.hp }}</td>
              <td>{{ monster.pb }}</td>
              <td>{{ monster.xp }}</td>

            </tr>
          }
        </table>
      } @else {
        <p>No monsters found matching your criteria.</p>
      }
    </div>
  `,
  // Update the styles in your component decorator:
  styles: [`
    :host {
      display: block;
      background-color: #1a1a1a;
      min-height: 100vh;
      color: #e0e0e0;
      font-family: 'Roboto', 'Arial', sans-serif;
      margin: 0;
      padding: 0;
    }

    div[style*="padding: 20px"] {
      padding: 1rem;
      width: 100%;
      box-sizing: border-box;
      margin: 0 auto;
      max-width: 1200px;
    }

    h2 {
      font-family: 'Cinzel', serif;
      color: #d4af37;
      text-align: center;
      font-size: clamp(1.5rem, 4vw, 2.5rem);
      margin: 0 0 1.5rem 0;
      padding: 1rem 1rem;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
      border-bottom: 2px solid #3a3a3a;
    }

    /* Search and Filter Container */
    [style*="margin-bottom: 20px"] {
      background: #2a2a2a;
      padding: 1rem;
      border-radius: 8px;
      margin: 0 0 1rem 0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      border: 1px solid #3a3a3a;
      width: 100%;
      box-sizing: border-box;
    }

    /* Name Search Input - Fixed Overflow */
    [style*="margin-bottom: 20px"] > input[type="text"] {
      width: calc(100% - 1rem);
      margin-right: 0;
      padding: 0.75rem;
    }



  /* Desktop styles - keep filters always expanded */
  @media (min-width: 769px) {
    [style*="display: flex; flex-wrap: wrap; gap: 20px;"] {
      display: flex !important;
    }
    
    button[style*="width: 100%"] {
      display: none;
    }
  }

/* Mobile-specific table fixes (won't affect other elements) */
@media (max-width: 768px) {
    /* Table container - full width with controlled scrolling */
    .table-container {
      margin-left: -1rem;
      margin-right: -1rem;
      width: calc(100% + 2rem);
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    /* Table itself - minimum readable width */
    table {
      min-width: 600px; /* Wide enough to show all columns reasonably */
      font-size: 0.9rem; /* Slightly smaller but still very readable */
    }

    /* Cell padding adjustments */
    th, td {
      padding: 0.75rem 0.5rem; /* Reduced side padding only */
    }
    th {
    cursor: pointer;
    position: relative;
    user-select: none;
    transition: background-color 0.2s ease;
  }

  th:hover {
    background-color: #4a5568 !important;
  }

  th span {
    margin-left: 0.25rem;
    font-size: 0.9em;
  }

  /* Keep sticky headers working with sorting */
  th {
    position: sticky;
    top: 0;
    z-index: 2;
  }

    /* Preserve zebra striping */
    tr:nth-child(even) td {
      background-color: #2f2f2f !important;
    }
    tr:nth-child(odd) td {
      background-color: #000000 !important;
    }

    /* Name column styling */
    td:first-child, th:first-child {
      min-width: 120px; /* Ensure name column stays readable */
      position: sticky;
      left: 0;
      z-index: 1;
      background: inherit; /* Maintain zebra striping */
      box-shadow: 2px 0 3px rgba(0,0,0,0.1); /* Visual separation */
    }

    th:first-child {
      background: #000000 !important;
    }

    /* CR column specific */
    td:nth-child(2) {
      min-width: 50px; /* Fixed width for CR values */
    }
  }

  /* Very small devices tweaks */
  @media (max-width: 480px) {
    table {
      font-size: 0.85rem;
    }
    
    th, td {
      padding: 0.6rem 0.4rem;
    }
  }
  
    /* Input Fields */
    input[type="text"], select {
      background-color: #333;
      color: #e0e0e0;
      border: 1px solid #444;
      border-radius: 4px;
      padding: 0.75rem;
      font-size: 1rem;
      transition: all 0.3s ease;
      width: 100%;
      margin: 0.5rem 0 1rem 0;
      box-sizing: border-box;
    }

    /* Table Container */
    .table-container {
      width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      margin: 1rem 0;
      border-radius: 8px;
      background: #2a2a2a;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
    }

    table {
      width: 100%;
      min-width: 600px;
      border-collapse: separate;
      border-spacing: 0;
    }

    /* Filter Grid Layout */
    [style*="display: flex; flex-wrap: wrap; gap: 20px;"] {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
      margin: 0;
    }

    /* Filter Items */
    [style*="flex: 1; min-width: 200px;"] {
      min-width: 100%;
      width: 100%;
    }

    /* Responsive Adjustments */
    @media (min-width: 600px) {
      div[style*="padding: 20px"] {
        padding: 1.5rem;
      }

      [style*="display: flex; flex-wrap: wrap; gap: 20px;"] {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (min-width: 900px) {
      div[style*="padding: 20px"] {
        padding: 2rem;
      }

      [style*="display: flex; flex-wrap: wrap; gap: 20px;"] {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    /* Keep existing interactive styles */
    input[type="text"]:focus, select:focus {
      outline: none;
      border-color: #d4af37;
      box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.3);
    }

    th {
      background: linear-gradient(to bottom, #3a3a3a, #2a2a2a);
      color: #d4af37;
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-family: 'Cinzel', serif;
      position: sticky;
      top: 0;
    }

    td {
      padding: 1rem;
      border-bottom: 1px solid #3a3a3a;
      transition: background-color 0.2s ease;
    }

    tr:hover td {
      background-color: #3a3a3a;
    }

    /* No Results Message */
    p {
      padding: 1rem;
      text-align: center;
    }
`]
})
export class MonsterSearchComponent implements OnInit {
  monsters: Monster[] = [];
  filteredMonsters: Monster[] = [];
  alignments: string[] = [];

  filtersExpanded = false;

  // Add this method
  toggleFilters() {
    this.filtersExpanded = !this.filtersExpanded;
  }
  
  // Filter properties
  searchName = '';
  searchType = '';
  searchAlignment = '';
  searchHabitat = '';
  
  // CR range handling
  crOptions = [0, 0.125, 0.25, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
  crMinIndex = 0;
  crMaxIndex = this.crOptions.length - 1;
  crRange: [number, number] = [0, 30];

  currentSortColumn: string = '';
  isSortAscending: boolean = true;

  // Add this method
  sortTable(column: string) {
    if (this.currentSortColumn === column) {
      this.isSortAscending = !this.isSortAscending;
    } else {
      this.currentSortColumn = column;
      this.isSortAscending = true;
    }

    this.filteredMonsters.sort((a, b) => {
      let valueA = a[column as keyof Monster];
      let valueB = b[column as keyof Monster];

      // Handle CR sorting differently (it's a number)
      if (column === 'cr' || column === 'initiative' || column === 'ac' || column === 'hp' || column === 'pb' || column === 'xp' ) {
        return this.isSortAscending ? (valueA as number) - (valueB as number) : (valueB as number) - (valueA as number);
      }

      // Default string comparison
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return this.isSortAscending 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      }
      return 0;
    });
  }
  
  private searchSubject = new Subject<string>();

  constructor(private monsterService: MonsterService) {}

  ngOnInit(): void {
    this.monsterService.getMonsters().subscribe((monsters) => {
      this.monsters = monsters;
      this.filteredMonsters = [...monsters];
      this.alignments = this.getUniqueAlignments(monsters);
      
      // Set initial CR range based on actual data
      const crValues = monsters.map(m => m.cr);
      const minCr = Math.min(...crValues);
      const maxCr = Math.max(...crValues);
      
      this.crMinIndex = this.crOptions.findIndex(cr => cr >= minCr);
      this.crMaxIndex = this.crOptions.findIndex(cr => cr >= maxCr);
      this.updateCrRange();
    });

    // Debounce name search input
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.applyFilters();
    });
  }

  updateCrRange(): void {
    // Ensure max is always >= min
    if (this.crMaxIndex < this.crMinIndex) {
      this.crMaxIndex = this.crMinIndex;
    }
    
    this.crRange = [
      this.crOptions[this.crMinIndex],
      this.crOptions[this.crMaxIndex]
    ];
    this.applyFilters();
  }

  onNameSearchChange(): void {
    this.searchSubject.next(this.searchName);
  }

  applyFilters(): void {
    this.filteredMonsters = this.monsters.filter((monster) => {
      const nameMatch = !this.searchName || 
        monster.name.toLowerCase().includes(this.searchName.toLowerCase());
      const typeMatch = !this.searchType || 
        monster.type.toLowerCase().includes(this.searchType.toLowerCase());
      const alignmentMatch = !this.searchAlignment || 
        monster.alignment === this.searchAlignment;
      const habitatMatch = !this.searchHabitat || 
        (monster.habitat && monster.habitat.toLowerCase().includes(this.searchHabitat.toLowerCase()));
      const crMatch = monster.cr >= this.crRange[0] && monster.cr <= this.crRange[1];
      
      return nameMatch && typeMatch && alignmentMatch && habitatMatch && crMatch;
    });
  }

  formatCrDisplay(cr: number): string {
    if (cr === 0.125) return "1/8";
    if (cr === 0.25) return "1/4";
    if (cr === 0.5) return "1/2";
    return cr.toString();
  }

  getUniqueAlignments(monsters: Monster[]): string[] {
    const uniqueAlignments = new Set<string>();
    monsters.forEach(monster => uniqueAlignments.add(monster.alignment));
    return Array.from(uniqueAlignments).sort();
  }
}