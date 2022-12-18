const Migrations = artifacts.require("Migrations");
const EtherShip = artifacts.require("EtherShip");

module.exports = function (deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(EtherShip);
}
