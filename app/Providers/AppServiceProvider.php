<?php

namespace App\Providers;

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;
use App\Models\Memo;
use App\Models\Tag;


class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        Schema::defaultStringLength(191);
        view()->composer('*', function ($view) {
            $user = \Auth::user();

            // $memoModel = new Memo();
            // $memos = $memoModel->myMemo( \Auth::id() );
            $foods = \DB::table('foods')->where('user_id', \Auth::id())->get();

            // $tagModel = new Tag();
            // $tags = $tagModel->where('user_id', \Auth::id())->get();

            // $view->with('user', $user)->with('memos', $memos)->with('tags', $tags);
            $view->with('user', $user)->with('foods', $foods);
        });
    }
}
