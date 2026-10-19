<?php

declare(strict_types=1);

use App\Enums\Log;
use App\Models\Commit;
use App\Models\User;

beforeEach(function (): void {
    config(['app.admins' => ['nunomaduro']]);
});

it('tells a guest page whether it is the team or a member who wrote it', function (string $page, string $entry): void {
    $team = User::factory()->create(['username' => 'nunomaduro']);
    $member = User::factory()->create(['username' => 'octocat']);

    $url = match ($page) {
        'team profile' => route('user.show', $team),
        'member profile' => route('user.show', $member),
        'member commit' => route('commit.show', [$member, Commit::factory()->for($member)->create()]),
    };

    $this->get($url)
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('referralEntry', $entry));
})->with([
    ['team profile', 'team'],
    ['member profile', 'member'],
    ['member commit', 'member'],
]);

it('tells nothing to signed in people, or on pages that are no profile or commit', function (): void {
    $member = User::factory()->create();

    $this->get(route('log.show', Log::Trending))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('referralEntry', null));

    $this->actingAs(User::factory()->create())
        ->get(route('user.show', $member))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('referralEntry', null));
});
