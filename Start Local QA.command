#!/bin/zsh
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
cd -- "${0:A:h}" || exit 1
npm run qa || exit $?
print '\nСкопируйте ссылку Local QA из вывода выше. Сервер продолжает работать после закрытия этого окна.'
