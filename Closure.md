**Closure:**

Na página de fechamento haverá uma lista dos meses fechados. 

Ex:
## Janeiro/2025: R$ 3590,00 Fechado
## Fevereiro/2025: R$ 4200,00 Fechado
## Março/2025: Aberto

Portanto, há de haver um endpoint que retorna cada mês fechado e o total desses meses fechados. Meses abertos não devem retornar o total
Os meses são trazidos de forma cronológica reversa (do último mês fechado pra trás) e com paginação (máximo 12 meses, 1 ano)

Em seguida, devo conseguir acessar cada mês fechado. Ao acessar um mês tenho uma visão geral: Quantidade de serviços prestados, faturamento, faturamento médio.

Posso também utilizar filtros por período (de tal dia a tal dia, contanto que seja no mesmo mês), tipo de serviço.

Sugestão Grok: 

Acesso a um mês fechado
Visão geral + filtros é ótimo, mas pense no fluxo: o barbeiro provavelmente vai querer baixar o relatório completo (PDF/CSV) diretamente dessa tela.
Sugestão: botão fixo “Gerar Relatório Completo” na visão do mês fechado (além dos filtros para drill-down).


Endpoints necessários para closure:

* Obter lista de fechamentos, com faturamento mensal
* Acessar um fechamento, obtendo Quantidade de serviços prestados, faturamento, faturamento médio.
* Fechar um mês
* Verificar se um mês está fechado ou aberto

Obter total de faturamento mensal (atualmente sem considerar tabela closure e obtendo somente um mês específico)