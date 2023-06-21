import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-videojuegos',
  templateUrl: './videojuegos.component.html',
  styleUrls: ['./videojuegos.component.css']
})
export class VideojuegosComponent implements OnInit {
  closeResult: any = "";
  token: any;
  response: any;
  form!: FormGroup;
  title!:  string;
  submitted = false;
  constructor(
    private http: HttpClient,
    public auth: AuthService, 
    private router: Router,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    ) { }

  ngOnInit(): void {
      this.auth.isAuthenticated$.subscribe(isAuthenticaed => {
        if(!isAuthenticaed) {
          this.router.navigate(['/inicio'])
        }
      })
      this.obtenerToken()
      this.form = this.formBuilder.group({
        nombre: ['', [Validators.required]],
        compania: ['', [Validators.required]],
        consola: ['', [Validators.required]],
        fecha_lanzamiento: ['', [Validators.required]],
        descripcion: ['', [Validators.required]],
      });  
  }
  obtenerToken() {
    this.auth.idTokenClaims$.subscribe(claims => {
      if (claims) {
        this.token = claims.__raw; // Obtiene el token de acceso
        this.consumirEndpoint(this.token);
        console.log(this.token);
      } else {
        console.error('Los claims del token de acceso son nulos o no están definidos.');
      }
    });
  }

  consumirEndpoint(token: string) {
    const url = 'https://h1t5qicgi1.execute-api.us-east-1.amazonaws.com/dev/serverless/videojuegos';
  
    // Crear los encabezados de la solicitud con el token de autorización y otros encabezados necesarios
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token,
    });
  
    // Hacer la solicitud HTTP GET utilizando HttpClient
    this.http.get(url, { headers }).subscribe(
      (response) => {
        this.response = response; // Almacena la respuesta en la variable
        console.log(response);
      },
      (error) => {
        console.error(error);
      }
    );
  }

    deleteVideoJuegoModal(content: any, viewProduct: any) {
      this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
        if (result === 'yes') {
          this.deleteVideoJuego(viewProduct);
        }
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
    }

    
  public deleteVideoJuego(id: any) {
    const url = `https://h1t5qicgi1.execute-api.us-east-1.amazonaws.com/dev/serverless/videojuego/${id}`;

    const headers = new HttpHeaders({
    'Authorization': 'Bearer ' + this.token, 
  });

  this.http.delete(url, { headers }).subscribe(
    (response) => {
      window.location.reload()
      console.log('Registro eliminado correctamente');
    },
    (error) => {
      console.error('Error al eliminar el registro:', error);
    }
  );
    
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }



  editVideoJuegoModal(content: any, id: any) {
    const url = `https://h1t5qicgi1.execute-api.us-east-1.amazonaws.com/dev/serverless/videojuego/${id}`;
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.token,
    });
    interface VideojuegoResponse {
      nombre: string;
      compania: string;
      consola: string;
      fecha_lanzamiento: string;
      descripcion: string;
    }
    this.http.get<VideojuegoResponse>(url, { headers }).subscribe(
      (response) => {
        this.form = this.formBuilder.group({
          nombre: [response.nombre, [Validators.required]],
          compania: [response.compania, [Validators.required]],
          consola: [response.consola, [Validators.required]],
          fecha_lanzamiento: [response.fecha_lanzamiento, [Validators.required]],
          descripcion: [response.descripcion, [Validators.required]],
        });
        console.log(response);
      },
      (error) => {
        console.error('Error al obtener el registro:', error);
      }
    );

    if (id != 0) {
      this.title = "Editar"
    } else if (id == 0) {
      this.title = "Crear"
    }
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;

      if (result === 'yes') {
        if (id != 0) {
          this.title = "Editar"

          const formValue = this.form.value;
          setTimeout(() => {
            console.log(formValue);
            const url = `https://h1t5qicgi1.execute-api.us-east-1.amazonaws.com/dev/serverless/videojuego/${id}`;
            const headers = new HttpHeaders({
              'Authorization': 'Bearer ' + this.token,
              'Content-Type': 'application/json'
            });

            this.http.put(url, formValue, { headers }).subscribe(
              (response) => {
                console.log('Registro actualizado correctamente:', response);
                Swal.fire('Actualización exitosa', 'El registro se ha actualizado correctamente.', 'success').then(() => {
                  location.reload();
                });
              },
              (error) => {
                console.error('Error al actualizar el registro:', error);
                Swal.fire('Error', 'Ha ocurrido un error al actualizar el registro.', 'error');
              }
            );
          }, 500)

        } else if (id == 0) {
          this.title = "Crear VideoJuego"
          const formValue = this.form.value;

          setTimeout(() => {
            console.log(formValue)
            const url = 'https://h1t5qicgi1.execute-api.us-east-1.amazonaws.com/dev/serverless/videojuego';
            const headers = new HttpHeaders({
              'Authorization': 'Bearer ' + this.token, 
              'Content-Type': 'application/json'
            });
          
            this.http.post(url, formValue, { headers }).subscribe(
              (response) => {
                console.log('Datos enviados correctamente:', response);
                Swal.fire('Creado exitosamente', 'El registro se ha creado correctamente.', 'success').then(() => {
                  location.reload();
                });
              },
              (error) => {
                console.error('Error al enviar los datos:', error);
                Swal.fire('Error', 'Ha ocurrido un error al actualizar el registro.', 'error');
              }
            );
          }, 500);
        }
      }
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
   }

   get position() { return this.form.controls }
   onSubmit(): void {
    this.submitted = true;
    if (this.submitted && this.position['nombre']?.errors) {
    }
    if (this.submitted && this.position['compania']?.errors) {
    }
    if (this.submitted && this.position['consola']?.errors) {
    }
    if (this.submitted && this.position['fecha_lanzamiento']?.errors) {
    }
    if (this.submitted && this.position['descripcion']?.errors) {
    }
  }
}
