import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'monster-detail/:id',
    loadChildren: () => import('./pages/monster-detail/monster-detail.module').then( m => m.MonsterDetailPageModule)
  },
  {
    path: 'attack-detail/:id',
    loadChildren: () => import('./pages/attack-detail/attack-detail.module').then( m => m.AttackDetailPageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
