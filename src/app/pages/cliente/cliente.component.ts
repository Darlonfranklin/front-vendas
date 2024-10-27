import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Cliente } from 'src/app/interfaces/cliente';
import { ClienteService } from './cliente.service';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.css']
})
export class ClienteComponent {
  clienteForm: FormGroup;
  itens: Cliente[] = [];
  totalPaginas: number = 0;
  tamanhoPagina: number = 5;
  paginaAtual: number = 1;
  clienteEmEdicaoId: number | null = null;

  private instanciaToast: any;
  public mensagemToast: string = '';
  public tipoToast: string = '';
  public tipoMensagem: string = '';

  constructor(private form: FormBuilder, private clienteService: ClienteService) {
    this.clienteForm = this.form.group({
      nome: ['', Validators.required],
      rg: ['', Validators.required],
      dataNascimento: ['', Validators.required],
      endereco: ['', Validators.required],
      sexo: ['', Validators.required],
      celular: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    const toastElement = document.getElementById('toast');
    if (toastElement) {
      this.instanciaToast = new (window as any).bootstrap.Toast(toastElement);
    }
    this.carregarClientes();
  }

  public salvarCliente(event: Event) {
    event.preventDefault();

    const cliente: Cliente = this.clienteForm.value;

    if (cliente.dataNascimento) {
      const dateParts = cliente.dataNascimento.split('-');
      if (dateParts.length === 3) {
        const [ano, mes, dia] = dateParts;
        cliente.dataNascimento = `${dia}/${mes}/${ano}`;
      }
    }

    if (this.clienteForm.invalid) {
      this.mensagemToast = 'Por favor, preencha todos os campos obrigatórios!';
      this.tipoToast = 'error';
      this.tipoMensagem = 'Erro';
      this.exibirToast();
      return;
    }

    if (this.clienteEmEdicaoId) {
      this.clienteService.editarCliente(this.clienteEmEdicaoId, cliente).subscribe({
        next: (response: any) => {
          const index = this.itens.findIndex((item) => item.id === this.clienteEmEdicaoId);
          if (index !== -1) {
            this.itens[index] = response;
          }
          this.mensagemToast = 'Cliente editado com sucesso!';
          this.tipoToast = 'success';
          this.tipoMensagem = 'Sucesso';
          this.clienteEmEdicaoId = null;
          this.clienteForm.reset();
          this.exibirToast();
        },
        error: (error: any) => {
          this.mensagemToast = 'Erro ao editar cliente! ' + error.message;
          this.tipoToast = 'error';
          this.tipoMensagem = 'Erro';
          this.exibirToast();
        }
      });
    } else {
      this.clienteService.salvarCliente(cliente).subscribe({
        next: (response) => {
          this.itens.push(response);
          this.mensagemToast = 'Cliente salvo com sucesso!';
          this.tipoToast = 'success';
          this.tipoMensagem = 'Sucesso';
          this.exibirToast();
          this.carregarClientes();
          this.clienteForm.reset();
        },
        error: (error) => {
          this.mensagemToast = 'Erro ao salvar cliente! ' + error.message;
          this.tipoToast = 'error';
          this.tipoMensagem = 'Erro';
          this.exibirToast();
        }
      });
    }
  }


  private exibirToast() {
    const toastElement = document.getElementById('toast');
    if (toastElement) {
      const corpoToast: any = toastElement.querySelector('.toast-body');
      const cabecalhoToast: any = toastElement.querySelector('.toast-header');

      corpoToast.textContent = this.mensagemToast;

      if (this.tipoToast === 'success') {
        cabecalhoToast.classList.remove('bg-danger', 'text-white');
        cabecalhoToast.classList.add('bg-success', 'text-white');
      } else {
        cabecalhoToast.classList.remove('bg-success', 'text-white');
        cabecalhoToast.classList.add('bg-danger', 'text-white');
      }

      this.instanciaToast.show();
    }
  }
  public deletarCliente(id: number) {
    this.clienteService.excluirCliente(id).subscribe({
      next: () => {
        this.itens = this.itens.filter(item => item.id !== id);
        this.mensagemToast = 'Cliente excluído com sucesso!';
        this.tipoToast = 'success';
        this.tipoMensagem = 'Sucesso';
        this.exibirToast();
      },
      error: (error) => {
        this.mensagemToast = 'Erro ao excluir cliente! ' + error.message;
        this.tipoToast = 'error';
        this.tipoMensagem = 'Erro';
        this.exibirToast();
      }
    });
  }
  public carregarClientes() {
    this.clienteService.buscarTodosClientes().subscribe((response: Cliente[] | any) => {
      if (response && Array.isArray(response)) {
        this.itens = response;
        this.totalPaginas = Math.ceil(this.itens.length / this.tamanhoPagina);
      } else {
        this.itens = [];
        this.totalPaginas = 0;
      }
    });
  }

  public editarCliente(cliente: Cliente) {
    this.clienteEmEdicaoId = cliente.id;
    this.clienteForm.patchValue(cliente);
  }


  public setPagina(pagina: number) {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaAtual = pagina;
  }

  get itensPorPagina(): Cliente[] {
    const inicio = (this.paginaAtual - 1) * this.tamanhoPagina;
    const fim = inicio + this.tamanhoPagina;
    return this.itens ? this.itens.slice(inicio, fim) : [];
  }

  get paginasVisiveis(): number[] {
    const paginas = [];
    const inicio = Math.max(this.paginaAtual - 2, 1);
    const fim = Math.min(inicio + 4, this.totalPaginas);

    for (let i = inicio; i <= fim; i++) {
      paginas.push(i);
    }

    return paginas;
  }
}
