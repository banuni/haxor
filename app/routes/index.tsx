import { createFileRoute, redirect } from '@tanstack/react-router';
import '../styles/globals.css';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  // redirect to player
  throw redirect({ to: '/player' });
}
