import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DrawerComponent } from '../drawer/drawer.component';
import { HeaderComponent } from '../header/header.component';
import { HeaderConfig, HeaderService } from '../../services/header.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, DrawerComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private headerService = inject(HeaderService);

  ngOnInit() {
    this.updateHeaderFromActiveRoute();

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.updateHeaderFromActiveRoute());
  }

  private updateHeaderFromActiveRoute() {
    let activeRoute = this.route;

    while (activeRoute.firstChild) {
      activeRoute = activeRoute.firstChild;
    }

    const header = activeRoute.snapshot.data['header'] as HeaderConfig | undefined;

    if (header) {
      this.headerService.updateHeaderFromRoute(header);
    }
  }
}
