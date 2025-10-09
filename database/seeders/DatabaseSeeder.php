<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Database\Seeders\SettingsSeeder;
use Database\Seeders\UsersSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\EquipmentSeeder;
use Database\Seeders\CamiloEquipmentSeeder;
use Database\Seeders\SparePartSeeder;
use Database\Seeders\MaintenanceSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RolePermissionSeeder::class);
        $this->call(UsersSeeder::class);
        $this->call(SettingsSeeder::class);
        $this->call(SparePartSeeder::class);
        $this->call(EquipmentSeeder::class);
        $this->call(CamiloEquipmentSeeder::class);
        $this->call(MaintenanceSeeder::class);
    }
}
