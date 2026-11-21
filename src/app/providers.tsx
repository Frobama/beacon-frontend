'use client';

import { ApolloProvider } from '@apollo/client';
import { useState, type ReactNode } from 'react';
import { makeClient } from '@/lib/apollo-client';

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(makeClient);
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
