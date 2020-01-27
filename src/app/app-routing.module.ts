import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{ path: '', loadChildren: './pages/tabs/tabs.module#TabsPageModule' },
	{ path: 'detail-monster/:id', loadChildren: './pages/detail-monster/detail-monster.module#DetailMonsterPageModule' },
	{ path: 'detail-attacke/:id', loadChildren: './pages/detail-attacke/detail-attacke.module#DetailAttackePageModule' },
	{ path: 'selected-monster', loadChildren: './pages/selected-monster/selected-monster.module#SelectedMonsterPageModule' },
	{ path: 'list-typen', loadChildren: './pages/list-typen/list-typen.module#ListTypenPageModule' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
