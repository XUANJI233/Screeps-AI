/**
 * Created by Amand on 6/20/2017.
 */
//let workerCreepModel = require('Models_Creep_WorkerModel');
//let stationaryCreepModel = require('Models_Creep_StationaryModel');
//let haulerCreepModel = require('Models_Creep_HaulerModel');

let jobsController = require('Controllers_Room_JobsController');
require('Prototypes_Spawn')();
require('Prototypes_Creep')();

require('Prototypes_CreepTypes_GeneralJobs_SupplyExtension')();
require('Prototypes_CreepTypes_GeneralJobs_SupplySpawn')();
require('Prototypes_CreepTypes_GeneralJobs_SupplyStorage')();
require('Prototypes_CreepTypes_GeneralJobs_SupplyTower')();

require('Prototypes_CreepTypes_Worker')();
require('Prototypes_CreepTypes_WorkerJobs_BuildStructure')();
require('Prototypes_CreepTypes_WorkerJobs_RepairStructure')();
require('Prototypes_CreepTypes_WorkerJobs_RepairWall')();
require('Prototypes_CreepTypes_WorkerJobs_UpgradeController')();

require('Prototypes_CreepTypes_Stationary')();
require('Prototypes_CreepTypes_StationaryJobs_ManageStorageAndTerminal')();
require('Prototypes_CreepTypes_StationaryJobs_HarvestEnergy')();
require('Prototypes_CreepTypes_StationaryJobs_HarvestResource')();

require('Prototypes_CreepTypes_Overseer')();
require('Prototypes_CreepTypes_OverseerJobs_ManageStorageAndTerminal')();

require('Prototypes_CreepTypes_Hauler')();
require('Prototypes_CreepTypes_HaulerJobs_Renew')();
require('Prototypes_CreepTypes_HaulerJobs_MoveEnergyFromContainer')();
require('Prototypes_CreepTypes_HaulerJobs_MoveResourceFromContainerToTerminal')();
require('Prototypes_CreepTypes_HaulerJobs_MoveResourceFromLabToTerminal')();
require('Prototypes_CreepTypes_HaulerJobs_CollectDroppedEnergy')();
require('Prototypes_CreepTypes_HaulerJobs_SupplyTerminalResource')();

require('Prototypes_CreepTypes_Remote')();
require('Prototypes_CreepTypes_RemoteJobs_ClaimController')();
require('Prototypes_CreepTypes_RemoteJobs_RemoteBuildStructure')();
require('Prototypes_CreepTypes_RemoteJobs_RemoteUpgradeController')();

require('Prototypes_CreepTypes_Maintainer')();

require('Prototypes_CreepTypes_Infantry')();

let RoomCreepsController =
{
	spawnCreeps: function (room)
	{
// TODO: REFACTOR ALL OF THIS GARBAGE LOGIC INTO SEPARATE FILES

		let DEFCON = room.memory.DEFCON;
		console.log("ROOM: " + room.name);

		let spawn = room.memory.structures.spawnsArray[0];
		let energyAvailable = room.energyAvailable;

		let energySourcesArray = room.memory.environment.energySourcesArray;
		let energySourcesCount = energySourcesArray.length;
		let storageCount = room.memory.structures.storageArray.length;
		let extractorCount = room.memory.structures.extractorsArray.length;

		let numberOfSmallestWorkerCreeps = room.memory.creeps.workerCreeps.smallestWorkerCreepsArray.length;
		let numberOfSmallerWorkerCreeps = room.memory.creeps.workerCreeps.smallerWorkerCreepsArray.length;
		let numberOfSmallWorkerCreeps = room.memory.creeps.workerCreeps.smallWorkerCreepsArray.length;
		let numberOfBigWorkerCreeps = room.memory.creeps.workerCreeps.bigWorkerCreepsArray.length;
		let numberOfBiggerWorkerCreeps = room.memory.creeps.workerCreeps.biggerWorkerCreepsArray.length;
		let numberOfBiggestWorkerCreeps = room.memory.creeps.workerCreeps.biggestWorkerCreepsArray.length;
		let totalNumberOfWorkerCreeps = numberOfSmallestWorkerCreeps + numberOfSmallerWorkerCreeps + numberOfSmallWorkerCreeps + numberOfBigWorkerCreeps + numberOfBiggerWorkerCreeps + numberOfBiggestWorkerCreeps;

		let numberOfStationaryCreeps = room.memory.creeps.stationaryCreeps.length;
		let numberOfOverseerCreeps = room.memory.creeps.overseerCreeps.length;
		let numberOfHaulerCreeps = room.memory.creeps.haulerCreeps.length;
		let numberOfMaintenanceCreeps = room.memory.creeps.maintenanceCreeps.length;

		let maximumNumberOfHarvesterStationaryCreeps = 0;
		if(room.controller.level >= 2){  maximumNumberOfHarvesterStationaryCreeps = room.memory.structures.containersArray.length; }

		let maximumNumberOfOverseerCreeps = 0;
		if(room.controller.level >= 4){ if(room.storage){maximumNumberOfOverseerCreeps = 1;} }

		let maximumNumberOfMaintenanceCreeps = 0;
		//if(room.controller.level >=5 && room.storage && room.storage.store[RESOURCE_ENERGY] > 100000){ maximumNumberOfMaintenanceCreeps = 3 - (8 - room.controller.level); }
		if(room.controller.level >=5 && room.storage && room.storage.store[RESOURCE_ENERGY] > 100000){ maximumNumberOfMaintenanceCreeps = 1; }

		let maximumNumberOfHarvestResourceCreeps = 0;
		let resourceID = room.memory.environment.resourcesArray[0];
		let resource = Game.getObjectById(resourceID);

		if(extractorCount > 0)
		{
			if (resource.ticksToRegeneration > 0)
			{}
			else
			{
				maximumNumberOfHarvestResourceCreeps = extractorCount;
			}
		}

		let maximumNumberOfStationaryCreeps = 0;
		if(room.controller.level >= 2){	maximumNumberOfStationaryCreeps = maximumNumberOfHarvesterStationaryCreeps; }

		let maximumNumberOfContainerHaulerCreeps = 0;
		if(room.controller.level >= 4)
		{	maximumNumberOfContainerHaulerCreeps = (room.memory.structures.containersArray.length + 2)
			- (room.memory.structures.linksArray.length * 2);
		}

		let numberOfClaimerCreeps = room.memory.creeps.remoteCreeps.claimerCreepsArray.length;
		let maximumNumberOfClaimerCreeps = 0;
		for(let flagName in room.memory.flags.claimController)
		{
			maximumNumberOfClaimerCreeps += 1;
		}

		let numberOfRemoteBuildStructureCreeps = room.memory.creeps.remoteCreeps.remoteBuildStructureCreepsArray.length;
		let maximumNumberOfRemoteBuildStructureCreeps = 0;
		for(let flagName in room.memory.flags.remoteBuildStructure)
		{
			maximumNumberOfRemoteBuildStructureCreeps += 1;
		}

		let numberOfRemoteUpgradeControllerCreeps = room.memory.creeps.remoteCreeps.remoteUpgradeControllerCreepsArray.length;
		let maximumNumberOfRemoteUpgradeControllerCreeps = 0;
		for(let flagName in room.memory.flags.remoteUpgradeController)
		{
			maximumNumberOfRemoteUpgradeControllerCreeps += 1;
		}

		let numberOfInfantryCreeps = room.memory.creeps.infantryCreeps.length;
		let maximumNumberOfInfantryCreeps = 0;
		for(let flagName in room.memory.flags.attack)
		{
			maximumNumberOfInfantryCreeps += 1;
		}

		//MY CURRENT FORMULA FOR SPAWNING SHIT
		let totalNumberOfOpenTilesNextToEnergySources = 0;
		for (let x = 0; x < energySourcesCount; x++)
		{
			totalNumberOfOpenTilesNextToEnergySources += energySourcesArray[x].numberOfAdjacentOpenTerrainTiles;
		}

		let numberOfBuildingJobs = 0;
		let buildingJobs = room.memory.jobs.workerJobBoard.firstPriorityJobs.buildStructure;
		for(let constructionSiteID in buildingJobs)
		{
			numberOfBuildingJobs += 1;
		}

		let maximumNumberOfWorkerCreeps = totalNumberOfOpenTilesNextToEnergySources + 3;

		if(room.controller.level >= 4 && room.storage)
		{
			maximumNumberOfWorkerCreeps = maximumNumberOfWorkerCreeps
			 - (numberOfStationaryCreeps * 2)
			 - (numberOfHaulerCreeps * 2);

			if(maximumNumberOfWorkerCreeps < 2)
			{
				maximumNumberOfWorkerCreeps = 1;
			}
			//console.log(maximumNumberOfWorkerCreeps);

			/*
			if(maximumNumberOfWorkerCreeps < 8)
			{
				maximumNumberOfWorkerCreeps = 8;
			}

			if(room.controller.level >= 4)
			{
				maximumNumberOfWorkerCreeps = 4;
			}

			if(room.controller.level >= 5)
			{
				maximumNumberOfWorkerCreeps = 2;
			}*/

			if((numberOfHaulerCreeps != 0 || maximumNumberOfContainerHaulerCreeps <= 0) && (numberOfStationaryCreeps != 0 && numberOfBuildingJobs == 0))
			{
				maximumNumberOfWorkerCreeps = 0;

				if(maximumNumberOfContainerHaulerCreeps <= 0)
				{
					if(room.energyAvailable < (room.energyCapacityAvailable - (room.memory.structures.spawnsArray.length * 300)))
					{
						maximumNumberOfWorkerCreeps = 1;
					}
				} 
			}
			else
			{
				if(numberOfHaulerCreeps != 0 && numberOfStationaryCreeps != 0)
				{
					maximumNumberOfWorkerCreeps = numberOfBuildingJobs;

					//to fix a problem with placing too many construction sites.
					if(maximumNumberOfWorkerCreeps > 4)
					{
						maximumNumberOfWorkerCreeps = 2;
					}
				}

				if(room.controller.level >= 7 && room.storage)
				{
					maximumNumberOfWorkerCreeps = 1;
				}
			}

			/*
			if( (numberOfHaulerCreeps != 0 && numberOfHaulerCreeps == maximumNumberOfContainerHaulerCreeps) &&
				(numberOfStationaryCreeps != 0 && numberOfStationaryCreeps == maximumNumberOfStationaryCreeps) &&
				numberOfBuildingJobs == 0)
			{
				maximumNumberOfWorkerCreeps = 0;
			}

			if(numberOfHaulerCreeps != 0 && numberOfStationaryCreeps != 0 && numberOfBuildingJobs == 0 && (numberOfHaulerCreeps >= maximumNumberOfContainerHaulerCreeps ||
				numberOfHaulerCreeps == maximumNumberOfContainerHaulerCreeps - 1) &&
				(numberOfStationaryCreeps >= maximumNumberOfStationaryCreeps ||
				numberOfStationaryCreeps == maximumNumberOfStationaryCreeps - 1))
			{
				maximumNumberOfWorkerCreeps = 0;
			}
			*/
		}

		/*

		 if(maximumNumberOfWorkerCreeps < 4)
		 {
		 if(numberOfBuildingJobs > 0)
		 {
		 maximumNumberOfWorkerCreeps = 4;
		 }
		 else
		 {
		 if (numberOfHaulerCreeps == 0)
		 {
		 maximumNumberOfWorkerCreeps = 2;
		 }
		 else
		 {
		 maximumNumberOfWorkerCreeps = 0;
		 }
		 }
		 }
		 */

		if(room.controller.level >= 2)
		{
			let ticksItTakesToSpawnNewStationaryCreep = spawn.getTicksToSpawnStationaryCreep(room.controller.level);;
			let energyRequiredToSpawnStationaryCreep = spawn.getEnergyRequiredToSpawnStationaryCreep(room.controller.level);

			let containersArray = room.memory.structures.containersArray;
			let containersCount = containersArray.length;

			if(containersCount > 0)
			{
				let ticksTillOldestStationaryCreepDies = 0;
				if (room.memory.creeps.stationaryCreeps.length > 0)
				{
					ticksTillOldestStationaryCreepDies = room.memory.creeps.stationaryCreeps[0].ticksToLive;
				}

				if (((numberOfStationaryCreeps < maximumNumberOfStationaryCreeps) ||
					(ticksTillOldestStationaryCreepDies < ticksItTakesToSpawnNewStationaryCreep && numberOfStationaryCreeps == maximumNumberOfStationaryCreeps))
					&& room.energyAvailable >= energyRequiredToSpawnStationaryCreep)
				{

					let dyingStationaryCreep = null;
					let dyingStationaryCreepJob = null;
					let potentialClosestSpawn = null;

					if(room.memory.creeps.stationaryCreeps[0]){dyingStationaryCreep = room.memory.creeps.stationaryCreeps[0];}

					if(dyingStationaryCreep != null)
					{
						if(dyingStationaryCreep.memory.job){ dyingStationaryCreepJob = dyingStationaryCreep.memory.job; }
						if(dyingStationaryCreepJob && Game.spawns[dyingStationaryCreep.memory.job.targetID]){  potentialClosestSpawn = Game.spawns[dyingStationaryCreep.memory.job.targetID]; }
					}

					if(potentialClosestSpawn != null)
					{
						potentialClosestSpawn.createStationaryCreep(room.controller.level);
					}
					else
					{
						let numberOfSpawns = room.memory.structures.spawnsArray.length;
						let spawnRandomizer = Math.floor((Math.random() * numberOfSpawns));
						let spawn = room.memory.structures.spawnsArray[spawnRandomizer];
						spawn.createStationaryCreep(room.controller.level);
					}
				}

				if(numberOfOverseerCreeps < maximumNumberOfOverseerCreeps)
				{
					let controllerID = room.controller.id;
					if(Game.spawns[controllerID])
					{
						Game.spawns[controllerID].createOverseerCreep();
					}
					else
					{
						let numberOfSpawns = room.memory.structures.spawnsArray.length;
						let spawnRandomizer = Math.floor((Math.random() * numberOfSpawns));
						let spawn = room.memory.structures.spawnsArray[spawnRandomizer];
						spawn.createOverseerCreep();
					}
				}

				console.log("numberOfStationaryCreeps:  " + numberOfStationaryCreeps + " maximumNumberOfStationaryCreeps: " + maximumNumberOfStationaryCreeps);
				console.log("numberOfOverseerCreeps:    " + numberOfOverseerCreeps +   " maximumNumberOfOverseerCreeps:   " + maximumNumberOfOverseerCreeps);
				
				if (numberOfStationaryCreeps >= maximumNumberOfStationaryCreeps
					&& numberOfStationaryCreeps > 0
					&& room.controller.level >= 4)
				{
					console.log('haulerCreeps:              ' + numberOfHaulerCreeps + " maxHaulerCreeps:                 " + maximumNumberOfContainerHaulerCreeps);


					let ticksTillOldestHaulerCreepDies = 61;
					if (room.memory.creeps.haulerCreeps.length > 0)
					{
						let ticksTillOldestHaulerCreepDies = room.memory.creeps.haulerCreeps[0].ticksToLive;
					}

					if (((numberOfHaulerCreeps < maximumNumberOfContainerHaulerCreeps) || (ticksTillOldestHaulerCreepDies < 60 && numberOfHaulerCreeps == maximumNumberOfContainerHaulerCreeps)) && room.energyAvailable >= 1000)
					{
						let numberOfSpawns = room.memory.structures.spawnsArray.length;
						let spawnRandomizer = Math.floor((Math.random() * numberOfSpawns));
						let spawn = room.memory.structures.spawnsArray[spawnRandomizer];
						spawn.createHaulerCreep(room);
					}

					//now spawn a claimer if necessary
					if (numberOfHaulerCreeps >= maximumNumberOfContainerHaulerCreeps)
					{
						if(room.controller.level >= 5)
						{
							console.log('maintenanceCreeps:         ' + numberOfMaintenanceCreeps + " maxNumberOfMaintenanceCreeps:    " + maximumNumberOfMaintenanceCreeps);
						

							let ticksTillOldestMaintainerCreepDies = 0;
							if (room.memory.creeps.maintenanceCreeps.length > 0)
							{
								ticksTillOldestMaintainerCreepDies = room.memory.creeps.maintenanceCreeps[0].ticksToLive;
							}

							if (((numberOfMaintenanceCreeps < maximumNumberOfMaintenanceCreeps) || (ticksTillOldestMaintainerCreepDies < 42 && numberOfMaintenanceCreeps == maximumNumberOfMaintenanceCreeps)) && room.storage && room.storage.store[RESOURCE_ENERGY] > 100000)
							{
								let numberOfSpawns = room.memory.structures.spawnsArray.length;
								let spawnRandomizer = Math.floor((Math.random() * numberOfSpawns));
								let spawn = room.memory.structures.spawnsArray[spawnRandomizer];
								spawn.createMaintenanceCreep(room);
							}

						}





						console.log('numberOfClaimerCreeps:                   ' + numberOfClaimerCreeps + " maximumNumberOfClaimerCreeps:                 " + maximumNumberOfClaimerCreeps);
						if (numberOfClaimerCreeps < maximumNumberOfClaimerCreeps)
						{
							numberOfSpawns = room.memory.structures.spawnsArray.length;
							let spawnRandomizer = Math.floor((Math.random() * numberOfSpawns));
							let spawn = room.memory.structures.spawnsArray[spawnRandomizer];
							spawn.createClaimerCreep(room);
						}

						console.log('numberOfRemoteBuildStructureCreeps:      ' + numberOfRemoteBuildStructureCreeps + " maximumNumberOfRemoteBuildStructureCreeps:    " + maximumNumberOfRemoteBuildStructureCreeps);
						if (numberOfRemoteBuildStructureCreeps < maximumNumberOfRemoteBuildStructureCreeps)
						{
							numberOfSpawns = room.memory.structures.spawnsArray.length;
							let spawnRandomizer = Math.floor((Math.random() * numberOfSpawns));
							let spawn = room.memory.structures.spawnsArray[spawnRandomizer];
							spawn.createRemoteBuildStructureCreep(room);
						}

						console.log('numberOfRemoteUpgradeControllerCreeps:   ' + numberOfRemoteUpgradeControllerCreeps + " maximumNumberOfRemoteUpgradeControllerCreeps: " + maximumNumberOfRemoteUpgradeControllerCreeps);
						if (numberOfRemoteUpgradeControllerCreeps < maximumNumberOfRemoteUpgradeControllerCreeps)
						{
							numberOfSpawns = room.memory.structures.spawnsArray.length;
							let spawnRandomizer = Math.floor((Math.random() * numberOfSpawns));
							let spawn = room.memory.structures.spawnsArray[spawnRandomizer];
							spawn.createRemoteUpgradeControllerCreep(room);
						}
/*
						console.log('numberOfInfantryCreeps:                   ' + numberOfInfantryCreeps + " maximumNumberOfInfantryCreeps: " + maximumNumberOfInfantryCreeps);
						if (numberOfInfantryCreeps < maximumNumberOfInfantryCreeps)
						{
							numberOfSpawns = room.memory.structures.spawnsArray.length;
							let spawnRandomizer = Math.floor((Math.random() * numberOfSpawns));
							let spawn = room.memory.structures.spawnsArray[spawnRandomizer];
							spawn.createInfantryCreep(room);
						}
						*/

						//maximumNumberOfInfantryCreeps

					}//more than one stationary creep	
				}//containers
			}

			/*
			 if(room.controller.level >= 4)
			 {
			 let numberOfContainers = 0;
			 let containersArray = room.memory.structures.containersArray;
			 let containersCount = containersArray.length;

			 if(containersCount > 0 && room.storage)
			 {
			 let ticksTillOldestBigStationaryCreepDies = 49;
			 if (room.memory.creeps.stationaryCreeps.bigStationaryCreepsArray.length > 0)
			 {
			 ticksTillOldestBigStationaryCreepDies = room.memory.creeps.stationaryCreeps.bigStationaryCreepsArray[0].ticksToLive;
			 }

			 if (((numberOfStationaryCreeps < maximumNumberOfStationaryCreeps) || (ticksTillOldestBigStationaryCreepDies < 48 && numberOfStationaryCreeps == maximumNumberOfStationaryCreeps)) && room.energyAvailable >= 1300)
			 {
			 let numberOfSpawns = room.memory.structures.spawnsArray.length;
			 let spawnRandomizer = Math.floor((Math.random() * numberOfSpawns));
			 let spawn = room.memory.structures.spawnsArray[spawnRandomizer];
			 spawn.createBigStationaryCreep(room);
			 }
			 console.log("numberOfStationaryCreeps:  " + numberOfStationaryCreeps + " maximumNumberOfStationaryCreeps: " + maximumNumberOfStationaryCreeps);
			 if (numberOfStationaryCreeps == maximumNumberOfStationaryCreeps)
			 {
			 console.log('haulerCreeps:              ' + numberOfHaulerCreeps + " maxHaulerCreeps:                 " + maximumNumberOfContainerHaulerCreeps);


			 let ticksTillOldestHaulerCreepDies = 61;
			 if (room.memory.creeps.haulerCreeps.length > 0)
			 {
			 let ticksTillOldestHaulerCreepDies = room.memory.creeps.haulerCreeps[0].ticksToLive;
			 }

			 if (((numberOfHaulerCreeps < maximumNumberOfContainerHaulerCreeps) || (ticksTillOldestHaulerCreepDies < 60 && numberOfHaulerCreeps == maximumNumberOfContainerHaulerCreeps)) && room.energyAvailable >= 1000)
			 {
			 let numberOfSpawns = room.memory.structures.spawnsArray.length;
			 let spawnRandomizer = Math.floor((Math.random() * numberOfSpawns));
			 let spawn = room.memory.structures.spawnsArray[spawnRandomizer];
			 spawn.createHaulerCreep(room);
			 }

			 //now spawn a claimer if necessary
			 if (numberOfHaulerCreeps == maximumNumberOfContainerHaulerCreeps)
			 {
			 console.log('numberOfClaimerCreeps: ' + numberOfClaimerCreeps + " maximumNumberOfClaimerCreeps: " + maximumNumberOfClaimerCreeps);
			 if (numberOfClaimerCreeps < maximumNumberOfClaimerCreeps)
			 {
			 numberOfSpawns = room.memory.structures.spawnsArray.length;
			 let spawnRandomizer = Math.floor((Math.random() * numberOfSpawns));
			 let spawn = room.memory.structures.spawnsArray[spawnRandomizer];
			 spawn.createClaimerCreep(room);
			 }

			 console.log('numberOfRemoteBuildStructureCreeps: ' + numberOfRemoteBuildStructureCreeps + " maximumNumberOfRemoteBuildStructureCreeps: " + maximumNumberOfRemoteBuildStructureCreeps);
			 if (numberOfRemoteBuildStructureCreeps < maximumNumberOfRemoteBuildStructureCreeps)
			 {
			 numberOfSpawns = room.memory.structures.spawnsArray.length;
			 let spawnRandomizer = Math.floor((Math.random() * numberOfSpawns));
			 let spawn = room.memory.structures.spawnsArray[spawnRandomizer];
			 spawn.createRemoteBuildStructureCreep(room);
			 }

			 console.log('numberOfRemoteUpgradeControllerCreeps: ' + numberOfRemoteUpgradeControllerCreeps + " maximumNumberOfRemoteUpgradeControllerCreeps: " + maximumNumberOfRemoteUpgradeControllerCreeps);
			 if (numberOfRemoteUpgradeControllerCreeps < maximumNumberOfRemoteUpgradeControllerCreeps)
			 {
			 numberOfSpawns = room.memory.structures.spawnsArray.length;
			 let spawnRandomizer = Math.floor((Math.random() * numberOfSpawns));
			 let spawn = room.memory.structures.spawnsArray[spawnRandomizer];
			 spawn.createRemoteUpgradeControllerCreep(room);
			 }
			 }//more than one stationary creep
			 }//numberOfContainers > 0
			 }
			 }//room.controller.level

			 */

			/*
			 let creepToDie = this.getSmallestWorkerCreepClosestToDeath(room);

			 if (creepToDie != null && (creepToDie.ticksToLive < 75 || Math.floor((Math.random() * 90) == 1)))
			 {
			 //revising the logic here...
			 //spawn if size BIGGER than creep to be suicided...
			 let energyCostOfCreepToDie = this.getEnergyCostOfWorkerCreepOfCertainSize(creepToDie.memory.size);
			 if (room.energyAvailable >= energyCostOfCreepToDie)
			 {
			 creepToDie.suicide();
			 this.spawnNewWorkerCreep(room);
			 }
			 }*/
		}

		console.log("totalNumberOfWorkerCreeps: " + totalNumberOfWorkerCreeps + " maximumNumberOfWorkerCreeps:     " + maximumNumberOfWorkerCreeps);
		if (totalNumberOfWorkerCreeps < maximumNumberOfWorkerCreeps)
		{
			let numberOfSpawns = room.memory.structures.spawnsArray.length;
			let spawnRandomizer = Math.floor((Math.random() * numberOfSpawns));
			let spawn = room.memory.structures.spawnsArray[spawnRandomizer];
			this.spawnNewWorkerCreep(room);
		}

		console.log("                 ");
	},

	getSmallestWorkerCreepClosestToDeath: function (room)
	{
		let ticksToLive = 1500
		let creepToDie = null;

		if (room.memory.creeps.workerCreeps.smallestWorkerCreepsArray.length > 0)
		{
			creepToDie = room.memory.creeps.workerCreeps.smallestWorkerCreepsArray[0];
			ticksToLive = room.memory.creeps.workerCreeps.smallestWorkerCreepsArray[0].ticksToLive;
		}

		if (room.memory.creeps.workerCreeps.smallerWorkerCreepsArray.length > 0 &&
			room.memory.creeps.workerCreeps.smallerWorkerCreepsArray[0] < ticksToLive)
		{
			creepToDie = room.memory.creeps.workerCreeps.smallerWorkerCreepsArray[0];
			ticksToLive = room.memory.creeps.workerCreeps.smallerWorkerCreepsArray[0].ticksToLive;
		}

		if (room.memory.creeps.workerCreeps.smallWorkerCreepsArray.length > 0 &&
			room.memory.creeps.workerCreeps.smallWorkerCreepsArray[0] < ticksToLive)
		{
			creepToDie = room.memory.creeps.workerCreeps.smallWorkerCreepsArray[0];
			ticksToLive = room.memory.creeps.workerCreeps.smallWorkerCreepsArray[0].ticksToLive;
		}

		if (room.memory.creeps.workerCreeps.bigWorkerCreepsArray.length > 0 &&
			room.memory.creeps.workerCreeps.bigWorkerCreepsArray[0] < ticksToLive)
		{
			creepToDie = room.memory.creeps.workerCreeps.bigWorkerCreepsArray[0];
			ticksToLive = room.memory.creeps.workerCreeps.bigWorkerCreepsArray[0].ticksToLive;
		}

		if (room.memory.creeps.workerCreeps.biggerWorkerCreepsArray.length > 0 &&
			room.memory.creeps.workerCreeps.biggerWorkerCreepsArray[0] < ticksToLive)
		{
			creepToDie = room.memory.creeps.workerCreeps.biggerWorkerCreepsArray[0];
			ticksToLive = room.memory.creeps.workerCreeps.biggerWorkerCreepsArray[0].ticksToLive;
		}

		if (room.memory.creeps.workerCreeps.biggestWorkerCreepsArray.length > 0 &&
			room.memory.creeps.workerCreeps.biggestWorkerCreepsArray[0] < ticksToLive)
		{
			creepToDie = room.memory.creeps.workerCreeps.biggestWorkerCreepsArray[0];
			ticksToLive = room.memory.creeps.workerCreeps.biggestWorkerCreepsArray[0].ticksToLive;
		}

		return creepToDie;
	},

	spawnNewWorkerCreep: function (room)
	{
		let spawn = room.memory.structures.spawnsArray[0]; //change this later to accomodate all spawns

		let totalEnergy = room.energyAvailable;

		if (totalEnergy >= 1450)
		{
			let newName = spawn.createBiggestWorkerCreep();
		}
		else if (totalEnergy >= 1150)
		{
			let newName = spawn.createBiggerWorkerCreep();
		}
		else if (totalEnergy >= 900)
		{
			let newName = spawn.createBigWorkerCreep();
		}
		else if (totalEnergy >= 700)
		{
			let newName = spawn.createSmallWorkerCreep();
		}
		else if (totalEnergy >= 450)
		{
			let newName = spawn.createSmallerWorkerCreep();
		}
		else if (totalEnergy >= 200)
		{
			let newName = spawn.createSmallestWorkerCreep();
		}
	},

	getEnergyCostOfWorkerCreepOfCertainSize: function(size)
	{
		let energyCost = 0;
		switch (size)
		{
			case 'smallest':
				energyCost = 200;
				break;
			case 'smaller':
				energyCost = 450;
				break;
			case 'small':
				energyCost = 700;
				break;
			case 'big':
				energyCost = 900;
				break;
			case 'bigger':
				energyCost = 1150;
				break;
			case 'biggest':
				energyCost = 1450;
				break;
			default:
				energyCost = 0;
		}
		return energyCost;
	},

	run: function (room)
	{
		let workerCreepsSizesArray = ["smallest", "smaller", "small", "big", "bigger", "biggest"];
		let workerCreepSizesCount = workerCreepsSizesArray.length;
		for (let z = 0; z < workerCreepSizesCount; z++)
		{
			let workerCreepsArray = room.memory.creeps.workerCreeps[workerCreepsSizesArray[z] + "WorkerCreepsArray"];
			let workerCreepsCount = workerCreepsArray.length;
			for (let x = 0; x < workerCreepsCount; x++)
			{
				let workerCreep = workerCreepsArray[x];
				workerCreep.run(workerCreep);
			}
		}

		let stationaryCreepsArray = room.memory.creeps.stationaryCreeps;
		let stationaryCreepsCount = stationaryCreepsArray.length;
		for(let x=0; x<stationaryCreepsCount; x++)
		{
			let stationaryCreep = stationaryCreepsArray[x];
			stationaryCreep.runStationary(stationaryCreep);
		}

		let overseerCreepsArray = room.memory.creeps.overseerCreeps;
		let overseerCreepsCount = overseerCreepsArray.length;
		for(let x=0; x<overseerCreepsCount; x++)
		{
			let overseerCreep = overseerCreepsArray[x];
			overseerCreep.runOverseer(overseerCreep);
		}

		let haulerCreepsArray = room.memory.creeps.haulerCreeps;
		let haulerCreepsCount = haulerCreepsArray.length;
		for(let x=0; x<haulerCreepsCount; x++)
		{
			let haulerCreep = haulerCreepsArray[x];
			haulerCreep.runHauler(haulerCreep);
		}

		let claimerCreepsArray = room.memory.creeps.remoteCreeps.claimerCreepsArray;
		let claimerCreepsCount = claimerCreepsArray.length;
		for(let x=0; x<claimerCreepsCount; x++)
		{
			let claimerCreep = claimerCreepsArray[x];
			claimerCreep.runRemote();
		}

		let remoteBuildStructureCreepsArray = room.memory.creeps.remoteCreeps.remoteBuildStructureCreepsArray;
		let remoteBuildStructureCreepsCount = remoteBuildStructureCreepsArray.length;
		for(let x=0; x<remoteBuildStructureCreepsCount; x++)
		{
			let remoteBuildStructureCreep = remoteBuildStructureCreepsArray[x];
			remoteBuildStructureCreep.runRemote();
		}

		let remoteUpgradeControllerCreepsArray = room.memory.creeps.remoteCreeps.remoteUpgradeControllerCreepsArray;
		let remoteUpgradeControllerCreepsCount = remoteUpgradeControllerCreepsArray.length;
		for(let x=0; x<remoteUpgradeControllerCreepsCount; x++)
		{
			let remoteUpgradeControllerCreep = remoteUpgradeControllerCreepsArray[x];

			remoteUpgradeControllerCreep.runRemote();
		}

		let infantryCreepsArray = room.memory.creeps.infantryCreeps;
		let infantryCreepsCount = infantryCreepsArray.length;
		for(let x=0; x<infantryCreepsCount; x++)
		{
			let infantryCreep = infantryCreepsArray[x];
			infantryCreep.runInfantry();
		}

		let maintenanceCreepsArray = room.memory.creeps.maintenanceCreeps;
		let maintenanceCreepsCount = maintenanceCreepsArray.length;
		for(let x=0; x<maintenanceCreepsCount; x++)
		{
			let maintenanceCreep = maintenanceCreepsArray[x];
			maintenanceCreep.runMaintainer();
		}
	}
};

module.exports = RoomCreepsController;