import { Component, Input } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { ComentarFeriaService } from '../../services/comentar-feria.service'

@Component({
  standalone: false,
  selector: 'app-comentar-feria',
  templateUrl: './comentar-feria.component.html',
  styleUrls: ['./comentar-feria.component.scss'],  // <--- aquí el SCSS
})
export class ComentarFeriaComponent {
  @Input() feriaId!: number
  comentario = ''
  enviando = false

  constructor(
    private modalCtrl: ModalController,
    private comentarService: ComentarFeriaService
  ) {}

  async enviarComentario() {
    if (!this.comentario.trim()) return

    this.enviando = true
    try {
      await this.comentarService.agregarComentario(this.feriaId, this.comentario)
      this.modalCtrl.dismiss({ recargar: true })
    } catch (error) {
      console.error('Error al enviar comentario:', error)
    } finally {
      this.enviando = false
    }
  }

  cerrarModal() {
    this.modalCtrl.dismiss()
  }

  get isComentarioInvalido(): boolean {
    return /[<>{}\[\]"'/\\]/.test(this.comentario);
  }
}
