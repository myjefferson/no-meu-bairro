insert into public.categories (nome, descricao) values
  ('Descarte irregular de lixo', 'Lixo descartado em local inadequado'),
  ('Buraco na via', 'Danos no pavimento de ruas e avenidas'),
  ('Iluminação pública', 'Luminária apagada ou danificada'),
  ('Espaço público', 'Problemas em praças e espaços de uso coletivo'),
  ('Outros', 'Outras situações urbanas')
on conflict (nome) do nothing;
