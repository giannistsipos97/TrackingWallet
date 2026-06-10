import { Component, inject } from '@angular/core';
import { HeaderService } from '../../services/header.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './drawer.component.html',
  styleUrl: './drawer.component.scss',
})
export class DrawerComponent {
  headerService = inject(HeaderService);
}
