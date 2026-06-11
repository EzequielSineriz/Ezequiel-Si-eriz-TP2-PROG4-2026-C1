export const authRoutes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register/register').then((m) => m.Register),

  }
];

export default authRoutes;
