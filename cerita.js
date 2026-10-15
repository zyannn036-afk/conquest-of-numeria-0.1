/* ===== Numeria Quest — Cerita NPC & Quest Rahasia =====
   Dimuat PALING AKHIR (setelah teleport.js), supaya membungkus H.npc versi terakhir.
   Cara kerja: setelah obrolan biasa dengan NPC bertanda cerita, muncul tombol untuk mendengar kisahnya.
   Kisah itu memicu quest rahasia yang tidak ada di Papan Quest; progres tampil di menu Misi.
   Mulai dari Desa Satuan: "Pecahan yang Terlupa" (Petani, Nelayan, Anak Desa, Rika).
   Menambah cerita NPC wilayah lain: tambahkan fungsi di STORY dan tandai NPC-nya di TAG.
   Data disimpan di F.sec (ikut tersimpan lewat saveGame). */
(function () {
  const sec = () => F.sec || (F.sec = { st: 0, sh: {}, ank: 0, rik: 0, nel: 0 }),
    nsh = () => Object.keys(sec().sh).length,
    give = (k) => {
      sec().sh[k] = 1;
      SND.sfx("quest");
      return `Kamu menerima Pecahan Aksioma (${nsh()}/3).`;
    };

  /* ---------- tandai NPC Desa Satuan (nama di town.js -> kunci cerita) ---------- */
  const TAG = {
    Petani: "petani",
    "Nelayan Desa": "nelayan",
    "Anak Desa": "anak",
    "Rika (Petualang Rank D)": "rika",
  };
  EN.O.forEach((e) => {
    if (e.t === "npc" && e.d && TAG[e.d[0]] && e.x >= 13 && e.x < 33 && e.y < 11) e.story = TAG[e.d[0]];
  });
  /* titik rahasia: batu berkilau di pojok kiri atas Desa Satuan (petak V 1,1) */
  EN.O.push({
    t: "spot",
    id: "batu",
    x: 14,
    y: 1,
    on: () => sec().st === 1 && sec().ank && !sec().sh.anak,
  });

  /* ---------- isi cerita ---------- */
  const STORY = {
    petani() {
      const s = sec();
      if (s.st === 0)
        return {
          label: "Dengarkan ceritanya",
          lines: [
            "Zzz... eh? Kamu memperhatikanku tidur dari tadi, ya? Duduklah sebentar, Nak.",
            "Tiga puluh tahun lalu aku bukan petani. Aku Penjaga Kristal Aksioma, penjaga termuda di Guild Penjaga Angka.",
            "Malam Sang Nol memecahkan kristal itu, aku sempat menyelamatkan tiga Pecahan Aksioma. Di dalamnya masih tersisa hitungan yang benar.",
            "Aku takut Sang Nol memburunya, jadi kutitipkan ketiganya ke orang desa tanpa mereka tahu. Sekarang aku sudah lupa siapa saja yang kutitipi.",
            "Tolong carikan. Coba tanya Nelayan, Anak Desa, dan Rika si petualang. Kembalilah padaku kalau sudah kamu kumpulkan.",
          ],
          go() {
            s.st = 1;
            SND.sfx("quest");
            return ["Quest rahasia dimulai: Pecahan yang Terlupa. Pantau di menu Misi."];
          },
        };
      if (s.st === 1) {
        if (nsh() >= 3)
          return {
            label: "Serahkan tiga pecahan",
            lines: [
              "Tiga pecahan... masih hangat! Terima kasih, Nak. Kamu tidak tahu betapa lamanya aku mencarinya.",
              "Dengar, Sang Nol dulu muridku. Namanya Nolan. Dia tidak jahat, dia hanya tidak tahan melihat hitungan yang tidak pernah genap.",
              "Kalau kamu bertemu dengannya, ingatkan bahwa nol bukan ketiadaan. Nol adalah tempat semua hitungan bermula.",
            ],
            go() {
              s.st = 2;
              Pl.coin += 150;
              Pl.pot += 3;
              Pl.fpot += 2;
              F.gp = (F.gp || 0) + 10;
              hud();
              SND.sfx("chest");
              return ["Hadiah: 150 koin, 3 Ramuan HP, 2 Ramuan Mana, +10 GP.", "Quest rahasia selesai: Pecahan yang Terlupa!"];
            },
          };
        const todo = [];
        if (!s.sh.nelayan) todo.push("Nelayan Desa");
        if (!s.sh.anak) todo.push("Anak Desa");
        if (!s.sh.rika) todo.push("Rika");
        return { label: "Tanya soal pecahan", lines: [`Baru ${nsh()} dari 3 pecahan. Yang belum: ${todo.join(", ")}.`] };
      }
      return null;
    },
    nelayan() {
      const s = sec();
      if (s.st !== 1 || s.sh.nelayan) return null;
      return {
        label: "Dengarkan ceritanya",
        lines: [
          "Ssst, kamu mau dengar? Sepuluh tahun lalu seekor ikan bulat menyambar umpanku, dan di perutnya ada batu bercahaya.",
          "Batunya berdenyut seperti sedang berhitung. Kusimpan di kotak umpan, sebab ikan jadi lebih jinak kalau dekat batu itu.",
          "Pak Petani mencarinya? Rupanya dulu dia yang menjatuhkannya ke kolam. Ambillah, ikan di sini toh tetap datang.",
        ],
        go: () => [give("nelayan")],
      };
    },
    anak() {
      const s = sec();
      if (s.st !== 1 || s.sh.anak) return null;
      if (!s.ank)
        return {
          label: "Dengarkan ceritanya",
          lines: [
            "Kak, aku punya rahasia! Dulu aku mengejar kupu-kupu dan menemukan batu bersinar di bawah pohon.",
            "Aku takut Ibu marah kalau kubawa pulang, jadi kukubur di pojok kiri atas desa, dekat pohon besar.",
            "Kakak boleh ambil, tapi jangan bilang Ibu ya!",
          ],
          go() {
            s.ank = 1;
            return ["Petunjuk: cari kilau di pojok kiri atas Desa Satuan, lalu tekan Spasi di depannya."];
          },
        };
      return { label: "Tanya lagi", lines: ["Di pojok kiri atas desa, dekat pohon besar! Cari yang berkilau, Kak."] };
    },
    rika() {
      const s = sec();
      if (s.st !== 1 || s.sh.rika) return null;
      const slimeDown = !!F.done[0];
      if (!s.rik)
        return {
          label: "Dengarkan ceritanya",
          lines: [
            "Kamu mau tahu kenapa aku masih Rank D? Karena aku menyimpan sesuatu yang bukan milikku.",
            "Ayahku pedagang. Seorang penjaga tua pernah membayar utangnya dengan liontin berhias pecahan kristal, dan liontin itu jatuh ke tanganku. Aku tidak berani menjualnya.",
            slimeDown
              ? "Kamu sudah mengalahkan Slime Retak di desa, jadi kamu pantas menerimanya. Ini, bawalah."
              : "Aku mau menyerahkannya, tapi malu: aku sendiri belum berani melawan Slime Retak di desa ini. Kalahkan dia, lalu temui aku lagi.",
          ],
          go() {
            s.rik = 1;
            return slimeDown ? [give("rika")] : ["Syarat dari Rika: kalahkan Slime Retak di Desa Satuan."];
          },
        };
      if (slimeDown)
        return {
          label: "Ambil liontin",
          lines: ["Slime itu sudah kalah? Kamu memang bisa diandalkan. Ini liontinnya, jaga baik-baik."],
          go: () => [give("rika")],
        };
      return { label: "Tanya lagi", lines: ["Liontinnya kuberikan setelah Slime Retak di desa ini kalah. Aku percaya padamu!"] };
    },
  };
  const story = (e) => (e.story && STORY[e.story] ? STORY[e.story]() : null);

  /* ---------- interaksi: obrolan biasa, lalu tawaran cerita ---------- */
  function offer(e, s) {
    busy = true;
    say(`${e.d[0]} sepertinya punya cerita.`);
    ui(
      `<div class="card"><b class="ok">${e.d[0]}</b><div class="qm" style="margin:4px 0">${s.go ? "Sepertinya ada kisah yang ingin dia ceritakan." : "Kamu bisa menanyakan hal tadi lagi."}</div><div class="row" style="margin-top:8px"><button class="b" id="sty">${s.label}</button><button class="b g" id="stn">Nanti saja</button></div></div>`,
    );
    $("#stn").onclick = idle;
    $("#sty").onclick = () => {
      const extra = s.go ? s.go() : [];
      hud();
      dlg(e.d[0], [...s.lines, ...extra]);
    };
    $("#sty").focus();
  }
  const _npc = H.npc;
  H.npc = (e) => {
    if (!e.story) return _npc(e);
    if (e.fx) e.fx.face = px >= e.x ? 1 : -1;
    const s = story(e);
    dlg(e.d[0], e.d[1], s ? () => offer(e, s) : null);
  };

  /* titik rahasia */
  H.spot = () => {
    const s = sec();
    if (s.sh.anak) return;
    SND.sfx("chest");
    const l = give("anak");
    dlg("Batu Berkilau", ["Tanah di sini baru digali. Ada pecahan kristal yang masih bersinar!", l]);
  };

  /* ---------- tampilan: tanda "!" di NPC, kilau di titik rahasia ---------- */
  const _ent = ent;
  ent = function (e, t, bob) {
    const X = e.x * 16,
      Y = e.y * 16 + OY;
    if (e.t === "spot") {
      const a = rm ? 0.8 : 0.5 + 0.4 * Math.sin(t / 220);
      ctx.globalAlpha = a;
      ctx.fillStyle = "#fff6b0";
      ctx.fillRect(X + 7, Y + 5, 2, 7);
      ctx.fillRect(X + 4, Y + 8, 8, 2);
      ctx.globalAlpha = 1;
      return;
    }
    _ent(e, t, bob);
    if (e.story) {
      const s = story(e);
      if (s && s.go) mark(e, X, Y, bob, 8);
    }
  };

  /* ---------- menu Misi: bagian Misi Rahasia (muncul setelah ditemukan) ---------- */
  function secretHtml() {
    const s = F.sec;
    if (!s || !s.st) return "";
    const st = s.st === 2 ? '<span class="mt ok">Selesai</span>' : `<span class="mt wip">${nsh()}/3 pecahan</span>`,
      det =
        s.st === 2
          ? "Ketiga pecahan sudah diserahkan kepada Petani."
          : `Kumpulkan tiga Pecahan Aksioma yang dititipkan Petani. Nelayan Desa ${s.sh.nelayan ? "✔" : "·"} Anak Desa ${s.sh.anak ? "✔" : "·"} Rika ${s.sh.rika ? "✔" : "·"}. ${nsh() >= 3 ? "Serahkan ke Petani!" : ""}`;
    return `<div class="qm" style="margin:10px 0 4px">Misi Rahasia</div><div class="irow"><div><b>Pecahan yang Terlupa</b> ${s.st === 2 ? '<span class="ok">✔</span>' : ""}<br><small>${det}<br>Hadiah: 150 koin · Ramuan · 10 GP</small></div>${st}</div>`;
  }
  const _mis = UIX.missions;
  UIX.missions = function () {
    const wasOpen = UIX.open && !document.querySelector("#mmis").hidden;
    _mis();
    if (!wasOpen) document.querySelector("#mlist").insertAdjacentHTML("beforeend", secretHtml());
  };
  const bm = document.querySelector("#bmis");
  if (bm) bm.onclick = UIX.missions;
})();
