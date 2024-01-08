const floatWindowLeft = document.createElement("div");
floatWindowLeft.classList.add("float-window-left");
floatWindowLeft.textContent = "ここに左側のコンテンツを追加";
document.body.appendChild(floatWindowLeft);
console.log("add float window left");
console.log(floatWindowLeft);

const floatWindowRight = document.createElement("div");
floatWindowRight.classList.add("float-window-right");
floatWindowRight.textContent = "ここに右側のコンテンツを追加";
document.body.appendChild(floatWindowRight);
console.log("add float window right");
console.log(floatWindowRight);

function getUserNamesAndIds(userNameElements) {
  var userNamesAndIds = [];
  var seenUids = new Set(); // 既に見つけたUIDを追跡するためのセット

  userNameElements.forEach(function (element) {
    var nameElement = element.querySelector(".userName__name");
    var uidElement = element.querySelector(".userName__uid");
    var name = nameElement ? nameElement.textContent.trim() : "";
    // UIDから先頭の"#"を除去する
    var uid = uidElement ? uidElement.textContent.trim().replace(/^#/, "") : "";

    // nameとuidが存在し、かつそのuidがまだ見つけられていない場合にのみ配列に追加する
    if (name && uid && !seenUids.has(uid)) {
      userNamesAndIds.push({ name: name, uid: uid });
      seenUids.add(uid); // 見つけたUIDをセットに追加する
    }
  });

  return userNamesAndIds;
}

async function executeCrawller() {
  var defaults = { dictUserNameId: [] };
  const items = await chrome.storage.local.get(defaults);
  console.log("現在の記憶データ");
  console.log(items);

  var userNameElements = document.querySelectorAll("a[href*='/users/']");
  var userNamesAndIds = getUserNamesAndIds(userNameElements);

  // 結果をコンソールに表示（デバッグ目的）
  console.log("収集したデータ");
  console.log(userNamesAndIds);

  try {
    // 既存のリストのUIDを取得
    const existingUids = new Set(items.dictUserNameId.map((item) => item.uid));

    // 新しいユーザーデータで既存のUIDを持たないもののみを追加
    userNamesAndIds = userNamesAndIds.filter(
      (item) => !existingUids.has(item.uid),
    );
    userNamesAndIds = items.dictUserNameId.concat(userNamesAndIds);

    var entity = { dictUserNameId: userNamesAndIds };

    console.log("上書き予定のデータ");
    console.log(entity);
    await chrome.storage.local.set(entity);
  } catch (error) {
    console.error("Error interacting with storage:", error);
  }
}

async function executeBattle() {
  var defaults = { dictUserNameId: [] };
  const items = await chrome.storage.local.get(defaults);
  console.log("現在の記憶データ");
  console.log(items);

  // HTML要素を選択する
  const userElements = document.querySelectorAll(
    ".battleHeader__battleUsers span",
  );

  // userDataからマッピングを作成する（検索を高速化するため）
  const userMap = new Map(
    items.dictUserNameId.map((user) => [user.name, user.uid]),
  );

  // 各ユーザー要素に対してループ処理
  userElements.forEach((userElement) => {
    const userName = userElement.textContent;
    if (userMap.has(userName)) {
      // ユーザー名に基づいてUIDを取得
      const uid = userMap.get(userName);
      // ユーザー名の後ろに # と UID を追加
      userElement.textContent = `${userName}#${uid}`;
    }
  });
}

setInterval(async () => {
  await executeCrawller();
  await executeBattle();
}, 5000);
