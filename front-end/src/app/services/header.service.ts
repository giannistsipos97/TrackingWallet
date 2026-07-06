import { computed, Injectable, signal } from '@angular/core';

export interface HeaderConfig {
  title: string;
  subtitle?: string;
  useProfileNameAsSubtitle?: boolean;
}

@Injectable({ providedIn: 'root' })
export class HeaderService {
  private headerConfig = signal<HeaderConfig>({
    title: 'Dashboard',
    subtitle: 'Welcome back',
  });
  private profileName = signal<string>('');

  title = computed(() => this.headerConfig().title);
  subtitle = computed(() => {
    const config = this.headerConfig();

    if (config.useProfileNameAsSubtitle) {
      return this.profileName() || config.subtitle || '';
    }

    return config.subtitle || '';
  });
  isDrawerOpen = signal<boolean>(false);

  updateHeader(
    title: string,
    subtitle: string = '',
    options: Pick<HeaderConfig, 'useProfileNameAsSubtitle'> = {},
  ) {
    this.headerConfig.set({
      title,
      subtitle,
      ...options,
    });
  }

  updateHeaderFromRoute(config: HeaderConfig) {
    this.headerConfig.set(config);
  }

  setProfileName(name: string) {
    this.profileName.set(name);
  }

  toggleDrawer() {
    this.isDrawerOpen.update((prev) => !prev);
  }
}
