import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { PaginationComponent } from '../../../components/pagination/pagination.component';
import { EmpresaOutput } from '../../../models/empresa/empresaOutput';
import { EmpresaService } from '../../../services/empresa/empresa.service';

@Component({
  selector: 'app-listar-empresas',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    PaginationComponent,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatChipsModule,
  ],
  templateUrl: './listar-empresas.component.html',
  styleUrls: ['./listar-empresas.component.css'],
})
export class ListarEmpresasComponent implements OnInit {
  empresas: EmpresaOutput[] = [];
  isLoading = false;
  searchTerm = '';
  errorMessages: string[] = [];
  successfullyRegisteredEmpresa = '';
  currentPage = 0;
  totalPages = 1;

  private searchSubject = new Subject<string>();

  constructor(private empresaService: EmpresaService, private router: Router) {
    const currentNavigation = router.getCurrentNavigation();
    if (currentNavigation?.extras?.state?.['successData']) {
      this.successfullyRegisteredEmpresa =
        currentNavigation.extras.state['successData'];
      setTimeout(() => {
        this.successfullyRegisteredEmpresa = '';
      }, 3000);
    }

    this.searchSubject.pipe(debounceTime(300)).subscribe((term) => {
      this.carregarPagina(0, term);
    });
  }

  ngOnInit(): void {
    this.carregarPagina(0);
  }

  searchEmpresas(term: string) {
    this.searchTerm = term.trim();
    this.searchSubject.next(this.searchTerm);
  }

  limparBusca() {
    this.searchTerm = '';
    this.carregarPagina(0);
  }

  carregarPagina(page: number, search: string = this.searchTerm) {
    const token = localStorage.getItem('token') as string;
    this.isLoading = true;
    this.empresas = [];

    this.empresaService.listar(token, page, search).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.errorMessages = [];
        if (res?.content?.length > 0) {
          this.empresas = res.content;
          this.currentPage = res.page?.number ?? 0;
          this.totalPages = res.page?.totalPages ?? 1;
        } else {
          this.empresas = [];
          this.currentPage = 0;
          this.totalPages = 1;
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        this.errorMessages = [
          err.error?.message ||
            'Ocorreu um erro inesperado. Tente novamente mais tarde.',
        ];
      },
    });
  }
}
