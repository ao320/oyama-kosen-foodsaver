@extends('layouts.app')
@section('content')
<div class="container d-flex justify-content-center create-blade" id="background">
    <a href="/home" class="home">食材</a>
    <div class="edit">編集</div>
    <a href="/create" class="create">登録</a>
</div>
<div class="row justify-content-center ml-0 mr-0 h-100 create-background">
    <div class="card w-100">
        <div class="contents margin">
            <button id="startNotifications" class="button btn mt-3">はかりに接続</button>
            <div id="device_name"> </div>
            <div id="data_text"> </div>
        </div>
            @csrf
            <div class="container" id="container">
                <canvas class="border" id="picture" hidden></canvas>
                <video id="camera" class="camera" video>
            </div>
            <button id="shutter" class="btn shutter m-auto">撮影</button>
            <div class="d-flex mx-auto">
                <button id="retake" class="btn shutter mt-5">取り直す</button>
                <button id="api" class="btn shutter mt-5">この画像で決定</button>
            </div>
            {{-- <button id="api">API</button> --}}
            <div id="form">
                <form method="POST" id="forms" action="/store">
                    <input type='hidden' name='user_id' value="{{ $user['id'] }}">
                    @csrf
                    食品名：<input type="text" class="form-control" name="foods" id="foodName" value=""><br>
                    重量　：<input type="number" id="weight" class="form-control" name="weight" value="">
                    <div id="result"></div>
                    <div class="d-flex">
                        <button type="button" class="btn mt-5" id="submit-button">保存して続ける</button>
                        <button type="submit" class="btn btn-red mt-5 submit">保存して終了</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
@vite('resources/js/reg.js')

@endsection
