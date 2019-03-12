var SteamCommunity = require('steamcommunity');
var TradeOfferManager =require('steam-tradeoffer-manager');

var login = require("facebook-chat-api");
var ReadLine = require('readline');
var fs = require('fs');
var events = require('events');


//User id let bot send the facebook message.
var yourID = 100000243548732;
//Main account id
var mainId = '76561198096250022';
//Main account token
var Token = ['OD77T6fx', 'T8PAHyDp', 'gYZryuFw', 'RSFWcN2m', 'nMxDUfBr',
					   'Grli3eut', 'NfmVBKTf', 'ggqPv3Gf'];
//Account
//var account = [1,2,4,5,6,7,8,9,10,11,12,13,14];
var account = [1,9,10,11,12];

//Bots' id
var botId = ['76561198096250022', '76561198286419402', '76561198290064250', '76561198300045446', '76561198299228772',
						 '76561198299935975', '76561198306062752', '76561198306064979'];
//Bots' number
var accnum = botId.length;

//AssetId to keep item  
var keepItem = [''];


var community = [];
var manager = [];
var share_secret = [];
var identity_secret =[];

var item = [];
var item2 = [{'Name':'value', 'AppId':'value', 'ContextId':'value', 'AssetId':'value'}];

var global_i = 0;

if(fs.existsSync('User.json')) {
	var Usercontents = fs.readFileSync("User.json");
    var UserContent = JSON.parse(Usercontents);
	for(var exUser in UserContent)
	{
		community[exUser] = new SteamCommunity();
		manager[exUser] = new TradeOfferManager({
		"domain": "example.com", // Our domain is example.com
		"language": "en", // We want English item descriptions
		"pollInterval": 5000 // We want to poll every 5 seconds since we don't have Steam notifying us of offers
		});
		share_secret[exUser] = UserContent[exUser].Shared_secret;
		identity_secret[exUser] = UserContent[exUser].Identity_secret;

		if(fs.existsSync('polldata.json')) {
			manager[exUser].pollData = JSON.parse(fs.readFileSync('polldata.json'));
		}
	}
}

var rl = ReadLine.createInterface({
	"input": process.stdin,
	"output": process.stdout
});
/*
if(fs.existsSync('ItemData.json')) {
	var contents = fs.readFileSync("ItemData.json");
	var ItemContent = JSON.parse(contents);
	console.log("Item List\n");
	for(var exItem in ItemContent)
	{
	  console.log("Name: "+ItemContent[exItem].Name);
	  console.log("Buying Price: "+ItemContent[exItem].Buying_Price);
	  console.log("Selling Price: "+ItemContent[exItem].Selling_Price+"\n");
	}
}*/
if(fs.existsSync('User.json')) {
	console.log("Attempting web login...\n");
	for(var exUser in UserContent)
	{
		for(var i = 0; i < account.length; i++)
		{
			if(exUser == "User" + account[i])
			{
				doLogin(community[exUser], manager[exUser], UserContent[exUser].Username, UserContent[exUser].Password, '', i, share_secret[exUser], identity_secret[exUser]);
				polloffer(community[exUser], manager[exUser], UserContent[exUser].Username, UserContent[exUser].Password, '', i, share_secret[exUser], identity_secret[exUser]);
			}
		}
	}
}

function doLogin(obj1, obj2, accountName, password, authCode, num, share_secret, identity_secret) {
	obj1.login({
		"accountName": accountName,
		"password": password,
		//"authCode": authCode,
		"twoFactorCode": authCode
	}, function(err, sessionID, cookies, steamguard) {
		if(err) {
			if(err.message == 'SteamGuardMobile') {
				//console.log("This account already has two-factor authentication enabled.");
				//process.exit();
				var SteamTotp = require('steam-totp');
				var twofactorcode = SteamTotp.generateAuthCode(share_secret);
				console.log("TwoFactorCode: " + twofactorcode);
				doLogin(obj1, obj2, accountName, password, twofactorcode, num, share_secret, identity_secret);
				return;
			}

			if(err.message == 'SteamGuard') {
				console.log("An email has been sent to your address at " + err.emaildomain);
				rl.question("Steam Guard Code: ", function(code) {
					doLogin(obj1, obj2, accountName, password, code, num, share_secret, identity_secret);
				});

				return;
			}

			console.log(err);
			doLogin(obj1, obj2, accountName, password, '', num, share_secret, identity_secret);
			return;
		}
		console.log("BOT"+ account[num] + "Logged on!");
		obj1.startConfirmationChecker(10000, identity_secret); // start the automatically checker

		obj2.setCookies(cookies, function(err) {
			if(err) {
				console.log(err);
				process.exit(1); // Fatal error since we couldn't get our API key
				return;
			}
			//console.log("Got API key: " + manager.apiKey);
			console.log("BOT" + account[num] + "Polling offers...");
		});

		//process.exit();
	});
}

function checkIsValid(arr, val) {
    return arr.some(function(arrVal) {
        return val === arrVal;
    });
}


function polloffer(obj1, obj2, accountName, password, authCode, num, share_secret, identity_secret){
	obj2.on('newOffer', function(offer) {
	console.log("------------------BOT" + account[num] + "-----------------");
	console.log("New offer #" + offer.id + " from " + offer.partner.getSteam3RenderedID());
	var SteamID = SteamCommunity.SteamID;
	var sid = new SteamID(offer.partner.getSteam3RenderedID());
	var isBot = false;
	if(checkIsValid(botId, sid.toString()) == true)
		isBot = true;

	/*
	for(var i = 0; i < 15; i++)
		process.stdout.write('\x07')*/
	var contents = fs.readFileSync("ItemData.json");
	var ItemContent = JSON.parse(contents);
	var key = [ "Huntsman Case Key", "Shadow Case Key", "Chroma Case Key", "Revolver Case Key",
                "Operation Breakout Case Key", "Operation Phoenix Case Key", "Falchion Case Key",
                "Operation Vanguard Case Key", "Winter Offensive Case Key","Chroma 2 Case Key", "CS:GO Case Key", "eSports Key","Operation Wildfire Case Key", "Chroma 3 Case Key", "Gamma Case Key", "Gamma 2 Case Key", "Glove Case Key"];
	var total = 0;
	var total2 = 0;
	var offer_Receive = JSON.stringify(offer.itemsToReceive);
	var isSelling = false;
	var isBuying = false;
	var isDonating = false;
	console.log("Receive following items: \n");

	var index = 0;
	var isChanging = true;
	var BuyItems = "";
	var SellItems = "";
	item1 = [];
	var itemCount = 0;
	var offerchanged = false;
	
	for(var offer_Receive_Item in offer.itemsToReceive)
	{
		var itemName = offer.itemsToReceive[offer_Receive_Item].market_hash_name;
		item1[itemCount] = itemName;
		console.log(itemName);
		BuyItems = BuyItems + itemName + ",";
		isDonating = true;
		for(var exItem in ItemContent)
		{
			if(ItemContent[exItem].Name == itemName)
			{
				total += parseInt(ItemContent[exItem].Buying_Price);
				isChanging = false;
				isBuying = true;
			}
		}
		for(var i = 0; i < key.length; i++)
			if(itemName == key[i])
				total ++;
	}
	
	if(total != 0)
	{
		console.log("Total: " + total + " keys");
	}
	
	
	var offer_Give = JSON.stringify(offer.itemsToGive);
	console.log("\nGive following items: \n");
	var isStealing = false;
	var index2 = 0;
	var itemCount = 0;
	var sellCount = 0;
	
	var isKeep = false;
	fs.writeFile('ItemTest.json', JSON.stringify(offer.itemsToGive));
	
	item2 = [];
	
	for(var offer_Give_Item in offer.itemsToGive)
	{
		var isCheck = false;
		var itemName = offer.itemsToGive[offer_Give_Item].market_hash_name;
		item2.push({'Name':itemName.toString(), 'AppId':offer.itemsToGive[offer_Give_Item].appid.toString(), 'ContextId':offer.itemsToGive[offer_Give_Item].contextid.toString(), 'AssetId':offer.itemsToGive[offer_Give_Item].assetid.toString()})

		if(checkIsValid(keepItem, item2[itemCount].AssetId) == true && item2[itemCount].AppId == 730 && item2[itemCount].ContextId == 2)
			isKeep = true;
		
		console.log(item2[itemCount].Name + " " + item2[itemCount].AssetId);
		
		SellItems = SellItems + itemName + ",";
		isDonating = false;
		if(isStealing == false)
		{
			for(var exItem in ItemContent)
			{
				if(itemName == ItemContent[exItem].Name)
				{
					total2 += parseInt(ItemContent[exItem].Selling_Price);
					isCheck = true;
					isChanging = false;
					isSelling = true;
					break;
				}
			}
			for(var i = 0; i < key.length; i++)
				if(itemName == key[i])
				{
					total2++;
					isCheck = true;
					break;
				}

			if(isCheck == false)
			{
				isStealing = true;
			}
		}
		
		itemCount++;
		sellCount++;
		
	}
	
	if(total2 != 0)
	{
		console.log("Total: " + total2 + " keys");
	}
	
	var isEmpty = false;
	if (isDonating == true && isChanging == true)
		isChanging = false;
	if (total == 0 && total2 == 0 && isDonating == false)
		isEmpty = true;
	
	offer.getEscrowDuration(function(err, daysTheirEscrow, daysMyEscrow) {
		//判斷能否接收提案
		if(((daysTheirEscrow != 3 && daysMyEscrow != 3 && daysTheirEscrow  != 15 && daysMyEscrow  != 15 && total >= total2 && isStealing == false && isEmpty == false && isChanging == false) || isBot == true) && isKeep == false){


			offer.accept(function(err) {
				//Unable to accept offer
				if(err) {
					console.log("Unable to accept offer: " + err.message);
					var error_message = err.message;
					doLogin(obj1, obj2, accountName, password, '', num, share_secret, identity_secret);

					if (isBuying == true)
					{
						var msg = {body: "BOT" + account[num] + "\n" + "Unable to accept offer:" + error_message + "\n" + "Buy: " + BuyItems + "\nPrice: " + total2 + " keys"};
					}
					if (isSelling == true)
					{
						var msg = {body: "BOT" + account[num] + "\n" + "Unable to accept offer:" + error_message + "\n" + "Sell: " + SellItems + "\nPrice: " + total + " keys"};
					}

					fb_message(msg);
				} else {
					obj1.checkConfirmations();
					console.log("-------------Offer accepted-------------");
					setTimeout(function(){
						obj2.getOffer(offer.id, function(err,offer) {
							if(!err)
							{
								//Can't confirm offer
								if(offer.state != TradeOfferManager.ETradeOfferState.Accepted)
								{
									console.log("Can't confirm the offer!");
									doLogin(obj1, obj2, accountName, password, '', num, share_secret, identity_secret);

									if (isBuying == true)
									{
										var msg = {body: "BOT" + account[num] + "\n" + "Unable to confirm offer" + "\n" + "Buy: " + BuyItems + "\nPrice: " + total2 + " keys"};
									}
									if (isSelling == true)
									{
										var msg = {body: "BOT" + account[num] + "\n" + "Unable to confirm offer" + "\n" + "Sell: " + SellItems + "\nPrice: " + total + " keys"};
									}
									fb_message(msg);
								}
								else
								{
									
									//Log items
									if(isSelling && item2.length > 0)
									{
										if(fs.existsSync('pendingItem.json')) 
										{
											var pendingContents = fs.readFileSync("pendingItem.json");
											var pendingContent = JSON.parse(pendingContents);

											for(var pending in pendingContent)
											{
												for(var i = 1; i < sellCount + 1; i++)
												{
													pendingContent["User" + account[num]]["Item" + i] = item2[i - 1].Name;
												}
											}
											fs.writeFileSync("pendingItem.json", JSON.stringify(pendingContent));
										}
									}


									console.log("-------------Offer confirmed------------");
									//Transfer keys
									var sendoffer = obj2.createOffer(mainId);
									obj2.loadInventory(730, 2, true, function(err,inventory,currencies){
										for(var i = 0; i < inventory.length; i++)
										{
											for(var j = 0; j < key.length; j++)
											{
												if(inventory[i].name == key[j])
												{
													sendoffer.addMyItem({"appid": 730, "contextid": 2, "assetid": inventory[i].assetid});
												}
											}
										}
										sendoffer.send("Transfer keys", Token[0], function(err, status) {
											if (err) {
												console.log(err);
											} else {
												console.log("Offer #" + sendoffer.id + " " + status);
											}
										});
									});

									if(isSelling && account[num] != 1)
									{
										var itemTransfer = 0;
										//for(var i = 1; i < botId.length; i++)
										var addItem = [];
										var sendoffer2 = obj2.createOffer(mainId);
										obj2.loadUserInventory(botId[0], 730, 2, true, function(err, inventory, currencies){
											for(var j = 0; j < item2.length; j++)
											{
												for(var k = 0; k < inventory.length; k++)
												{
													if(item2[j].Name == inventory[k].market_hash_name)
													{
														console.log(inventory[k].market_hash_name);
														addItem.push(k);
														itemTransfer++;
													}
												}

												if(itemTransfer >= 2)
												{
													for(var m = 0; m < itemTransfer - 1; m++)
														addItem.pop();
													delete item2[j];
												}
												else if(itemTransfer == 1 && account[0] != 1)
												{
													addItem.pop();
													delete item2[j];
												}
												itemTransfer = 0;
											}

											for(var n = 0; n < addItem.length; n++)
											{
												sendoffer2.addTheirItem({"appid": 730, "contextid": 2, "assetid": inventory[addItem[n]].assetid});
											}

											sendoffer2.send("Ask to transfer skins", Token[0], function(err, status) {
												if (err) {
													console.log(err);
												} else {
													console.log("Offer #" + sendoffer2.id + " " + status);
												}
											});

										});
									}

									if(!isBot)
									{
										//Send succes message
										if (isBuying == true)
										{
											var msg = {body: "BOT"+ account[num] + "\n" + "Offer accepted!!\n" + "Buy: " + BuyItems + "\nPrice: " + total2 + " keys"};
										}
										if (isSelling == true)
										{
											var msg = {body: "BOT"+ account[num] + "\n" + "Offer accepted!!\n" + "Sell: " + SellItems + "\nPrice: " + total + " keys"};
										}
										fb_message(msg);
									}
								}
							}
					});}, 30000);
				}
			});
		}
		else{
			//decline the offer
			offer.decline(function(err) {
				if(err) {
					console.log("Unable to decline offer: " + err.message);
				} else {
				console.log("-------------Offer declined------------");
				}
			});
			console.log("\nMy Escrow: " + daysMyEscrow);
			console.log("Their Escrow: " + daysTheirEscrow);
			if(daysMyEscrow == 3 || daysTheirEscrow == 3 || daysTheirEscrow  == 15 || daysMyEscrow  == 15)
			{
				console.log("There will be a trade hold if we accept this trade!");
			}
			if(isStealing == true)
				console.log("Someone want to steal the item!");

		}
		console.log("----------------------------------------");
		});
	});
}

function fb_message(msg)
{
	login({email: "csgomessagebot@gmail.com", password: "2gjixdjl"}, function callback (err, api) {
		if(err)
		{
			console.error(err);
			fb_message(msg);
		}
		else {
			api.sendMessage(msg, yourID);
		}
	});
}
/*
function pendItem()
{
	var pendingContents = fs.readFileSync("pendingItem.json");
	var pendingContent = JSON.parse(pendingContents);
	//哪些帳號缺貨
	for(var User in pendingContent)
	{
		//其他帳號補貨
		for(var i = 0; i < account.length; i++)
		{
			//確認是其他帳號
			if(User != "User" + account[i])
			{
				var addItem = [];
				manager["User" + account[i]].loadUserInventory(botId[i], 730, 2, true, function(err, inventory, currencies){
					var sendoffer = community["User" + account[i]].createOffer(botId[i]);
					for(var Item in pendingContent["User" + account[i]])
					{
						for(var j = 0; j < inventory.length; j++)
						{
							if(pendingContent[User][Item] == inventory[j])
							{
								addItem.push(j);
								itemTransfer++;
							}
						}

						if(itemTransfer >= 2)
						{
							for(var m = 0; m < itemTransfer - 1; m++)
								addItem.pop();
						}
						else if(itemTransfer == 1 && account[i] != 1)
						{
							addItem.pop();
						}
						itemTransfer = 0;
					}

					for(var k = 0; k < addItem.length; k++)
						sendoffer.addMyItem({"appid": 730, "contextid": 2, "assetid": inventory[addItem[k]].assetid});

					sendoffer.send("Transfer", mainToken, function(err, status) {
						if (err) {
							console.log(err);
						} else {
							console.log("Offer #" + sendoffer.id + " " + status);
						}
					});
				});
			}
		}
	}
}
*/
if(fs.existsSync('polldata.json')) {
	for(var exUser in UserContent)
		manager[exUser].on('pollData', function(pollData) {
			fs.writeFile('polldata.json', JSON.stringify(pollData));
		});
}
