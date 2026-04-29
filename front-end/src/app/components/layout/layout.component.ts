import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DrawerComponent } from '../drawer/drawer.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, DrawerComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  constructor() {}
}
