<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Foods;


class HomeController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
    public function index()
    {
        $foods = Foods::select("foods.*")->where('status', 1);
        return view('home', ["foods" => $foods]);
        return view('edit', ["foods" => $foods]);
    }

    public function create()
    {
        return view('create');
    }

    public function store(Request $request)
    {
        $data = $request->all();
        // dd($data);
        \DB::table("foods")->insert([
            "foods_name" => $data["foods"],
            "weight" => $data["weight"],
            "user_id" => $data["user_id"],
            "status" => 1
        ]);

        return redirect()->route('home');
    }

    public function edit($id){
        $user = \Auth::user();
        $foods = \DB::table("foods")->get();
        return view('edit',compact('foods'));
    }

    public function update(Request $request, $id)
    {
        $inputs = $request->all();
        \DB::table("foods")->where('id', $id)->update(["foods_name" => $inputs["foods_name"], "weight" => $inputs["weight"]]);
        return redirect()->route("home");
    }

    public function delete($id)
    {
        //論理削除
        \DB::table("foods")->where("id", $id)->update(["status" => 2]);
        return redirect()->route('home')->with('success', '食材の削除が完了しました');
    }
}
