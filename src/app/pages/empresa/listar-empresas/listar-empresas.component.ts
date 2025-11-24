import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
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
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  templateUrl: './listar-empresas.component.html',
  styleUrls: ['./listar-empresas.component.css'],
})
export class ListarEmpresasComponent implements OnInit {
  empresas: EmpresaOutput[] = [];

  isLoading = false;
  loadingFailed = false;
  errorMessages: string[] = [];
  successfullyRegisteredEmpresa = '';

  searchTerm = '';
  selectedAtivo = '';

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
    this.searchTerm = term;
    this.searchSubject.next(this.searchTerm.trim());
  }

  onFilterChange() {
    this.currentPage = 0;
    this.carregarPagina(0);
  }

  limparBusca() {
    this.searchTerm = '';
    this.selectedAtivo = '';
    this.carregarPagina(0);
  }

  carregarPagina(page: number, search: string = this.searchTerm) {
    const token = localStorage.getItem('token') as string;
    this.isLoading = true;
    this.loadingFailed = false;
    this.empresas = [];

    this.empresaService
      .listar(token, page, search, this.selectedAtivo)
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          this.errorMessages = [];

          if (res?.content) {
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
          this.loadingFailed = true;
          this.errorMessages = [
            err.error?.message ||
              'Ocorreu um erro inesperado ao carregar as empresas.',
          ];
        },
      });
  }
}
