import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css'],
})
export class PaginationComponent {

  @Input() pageNumber: number = 0;
  @Input() totalPages: number = 1;

  @Input() maxPagesToShow: number = 5;

  @Output() pageChange = new EventEmitter<number>();

  get pages(): number[] {
    const pages: number[] = [];
    const half = Math.floor(this.maxPagesToShow / 2);

    let start = Math.max(0, this.pageNumber - half);
    let end = Math.min(this.totalPages - 1, start + this.maxPagesToShow - 1);

    if (end - start < this.maxPagesToShow - 1) {
      start = Math.max(0, end - (this.maxPagesToShow - 1));
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages && page !== this.pageNumber) {
      this.pageChange.emit(page);
    }
  }

  nextPage() {
    this.goToPage(this.pageNumber + 1);
  }

  previousPage() {
    this.goToPage(this.pageNumber - 1);
  }
}
