// importação de dependência(s)
import express from "express";
import fs from "fs";

const app = express();

// variáveis globais deste módulo
const PORT = 3000;
const db = {};

// carregar "banco de dados" (data/jogadores.json e data/jogosPorJogador.json)
// você pode colocar o conteúdo dos arquivos json no objeto "db" logo abaixo
// dica: 1-4 linhas de código (você deve usar o módulo de filesystem (fs))
fs.readFile("server/data/jogadores.json", (e, data) => {
  if (e) {
    console.log(e);
  } else {
    db.jogadores = JSON.parse(data);
  }
});

fs.readFile("server/data/jogosPorJogador.json", (e, data) => {
  if (e) {
    console.log(e);
  } else {
    db.jogosPorJogador = JSON.parse(data);
  }
});

// configurar qual templating engine usar. Sugestão: hbs (handlebars)
//app.set('view engine', '???qual-templating-engine???');
//app.set('views', '???caminho-ate-pasta???');
// dica: 2 linhas
app.set("view engine", "hbs");
app.set("views", "server/views");

// EXERCÍCIO 2
// definir rota para página inicial --> renderizar a view index, usando os
// dados do banco de dados "data/jogadores.json" com a lista de jogadores
// dica: o handler desta função é bem simples - basta passar para o template
//       os dados do arquivo data/jogadores.json (~3 linhas)
app.get("/", (_, res) => {
  res.render("index.hbs", db.jogadores);
});

// EXERCÍCIO 3
// definir rota para página de detalhes de um jogador --> renderizar a view
// jogador, usando os dados do banco de dados "data/jogadores.json" e
// "data/jogosPorJogador.json", assim como alguns campos calculados
// dica: o handler desta função pode chegar a ter ~15 linhas de código
function sortByPlaytimeDec(a, b) {
  return b.playtime_forever - a.playtime_forever;
}

function hoursOfPlaytime(game) {
  game.playtime_hours = Math.round(game.playtime_forever / 60);
}

app.get("/jogador/:id", (req, res) => {
  const { id } = req.params;
  const player = db.jogadores.players.find((player) => player.steamid === id);

  let playerInfo = {};
  if (player) {
    const playerGames = db.jogosPorJogador[id];

    let sortedGames = playerGames.games.sort(sortByPlaytimeDec);
    playerInfo = {
      gamecount: playerGames.game_count,
      notplayed: playerGames.games.filter((game) => game.playtime_forever === 0)
        .length,
      top5games: sortedGames.slice(0, 5),
      ...player,
    };

    playerInfo.top5games.forEach(hoursOfPlaytime);
  } else {
    console.log("Player does not exist.");
  }

  res.render("jogador.hbs", playerInfo);
});

// EXERCÍCIO 1
// configurar para servir os arquivos estáticos da pasta "client"
// dica: 1 linha de código
app.use(express.static("client"));

// abrir servidor na porta 3000 (constante PORT)
// dica: 1-3 linhas de código
app.listen(PORT, () => {
  console.log(`Listening on localhost:${PORT}`);
});
