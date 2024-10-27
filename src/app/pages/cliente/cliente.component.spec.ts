import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ClienteService } from './cliente.service';
import { Cliente } from 'src/app/interfaces/cliente';

describe('ClienteService', () => {
  let service: ClienteService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ClienteService]
    });
    service = TestBed.inject(ClienteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve buscar todos os clientes', () => {
    const mockClientes: Cliente[] | any = [
      { id: 1, nome: 'Cliente 1', rg: '123456789', dataNascimento: '2000-01-01', endereco: 'Endereço 1', sexo: 'M', celular: '123456789', email: 'cliente1@example.com' },
      { id: 2, nome: 'Cliente 2', rg: '987654321', dataNascimento: '1990-01-01', endereco: 'Endereço 2', sexo: 'F', celular: '987654321', email: 'cliente2@example.com' }
    ];

    service.buscarTodosClientes().subscribe(clientes => {
      expect(clientes).toEqual(mockClientes);
    });

    const req = httpMock.expectOne('http://localhost:8080/clientes');
    expect(req.request.method).toBe('GET');
    req.flush(mockClientes);
  });

  it('deve salvar um cliente', () => {
    const novoCliente: Cliente = { id: 0, nome: 'Novo Cliente', rg: '555555555', dataNascimento: '2000-01-01', endereco: 'Novo Endereço', sexo: 'M', celular: '555555555', email: 'novocliente@example.com' };

    service.salvarCliente(novoCliente).subscribe(cliente => {
      expect(cliente).toEqual({ ...novoCliente, id: 1 }); 
    });

    const req = httpMock.expectOne('http://localhost:8080/clientes');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(novoCliente);
    req.flush({ ...novoCliente, id: 1 }); 
  });
});
